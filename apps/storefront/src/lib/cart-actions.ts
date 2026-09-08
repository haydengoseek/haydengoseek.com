"use server"

import { cookies } from "next/headers"
import { medusa, getRegion } from "./medusa"

const CART_COOKIE = "hgs_cart_id"

// Only Australia is a configured region/shipping zone today — see the
// README's "Scope decisions" note on checkout. Fixed here rather than a
// form field since there's nothing else to select.
const COUNTRY_CODE = "au"

function itemCount(cart: { items?: { quantity: number }[] | null }): number {
  return cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
}

async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(CART_COOKIE)?.value
  if (existing) {
    // Confirm it still exists server-side (e.g. survives a DB reseed in dev).
    try {
      await medusa.store.cart.retrieve(existing)
      return existing
    } catch {
      // fall through and create a new one
    }
  }

  const region = await getRegion()
  const { cart } = await medusa.store.cart.create({ region_id: region.id })
  cookieStore.set(CART_COOKIE, cart.id, { httpOnly: true, sameSite: "lax", path: "/" })
  return cart.id
}

async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value ?? null
}

export type AddToCartResult = { success: true; itemCount: number } | { success: false; error: string }

export async function addToCart(variantId: string, quantity = 1): Promise<AddToCartResult> {
  const cartId = await getOrCreateCartId()
  try {
    await medusa.store.cart.createLineItem(cartId, { variant_id: variantId, quantity })
  } catch {
    // Most commonly: the variant sold out or its remaining stock was reserved
    // by another cart between page load and this click.
    return { success: false, error: "Sorry, this is no longer available." }
  }
  const { cart } = await medusa.store.cart.retrieve(cartId, { fields: "items.quantity" })
  return { success: true, itemCount: itemCount(cart) }
}

export async function getCartItemCount(): Promise<number> {
  const cartId = await getCartId()
  if (!cartId) return 0
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId, { fields: "items.quantity" })
    return itemCount(cart)
  } catch {
    return 0
  }
}

// Note: Medusa's own "subtotal" field is items + shipping combined (see its
// own doc comment: "sum of item_subtotal and shipping_subtotal"), not the
// items-only figure a "Subtotal" row conventionally means next to a separate
// "Shipping" row — so this fetches item_subtotal instead and surfaces that
// as `subtotal` below.
const CART_FIELDS =
  "id,email,currency_code,item_subtotal,shipping_total,tax_total,total," +
  "*items,*shipping_address,*shipping_methods,*payment_collection.payment_sessions"

export type CartLineItem = {
  id: string
  title: string
  thumbnail: string | null
  quantity: number
  unitPrice: number
  variantTitle: string | null
  productHandle: string | null
}

export type Cart = {
  id: string
  email: string | null
  currencyCode: string
  items: CartLineItem[]
  subtotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  hasShippingMethod: boolean
  shippingAddress: {
    firstName: string | null
    lastName: string | null
    address1: string | null
    address2: string | null
    city: string | null
    province: string | null
    postalCode: string | null
    phone: string | null
  } | null
}

type RawCartLineItem = {
  id: string
  title: string
  product_title?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price: number
  variant_title?: string | null
  product_handle?: string | null
}

type RawCartAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  phone?: string | null
}

type RawCart = {
  id: string
  email?: string | null
  currency_code: string
  items?: RawCartLineItem[] | null
  item_subtotal?: number
  shipping_total?: number
  tax_total?: number
  total?: number
  shipping_methods?: unknown[] | null
  shipping_address?: RawCartAddress | null
}

function toCart(rawCart: unknown): Cart {
  const raw = rawCart as RawCart
  return {
    id: raw.id,
    email: raw.email ?? null,
    currencyCode: raw.currency_code,
    items: (raw.items ?? []).map((item) => ({
      id: item.id,
      title: item.product_title ?? item.title,
      thumbnail: item.thumbnail ?? null,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      variantTitle: item.variant_title ?? null,
      productHandle: item.product_handle ?? null,
    })),
    subtotal: raw.item_subtotal ?? 0,
    shippingTotal: raw.shipping_total ?? 0,
    taxTotal: raw.tax_total ?? 0,
    total: raw.total ?? 0,
    hasShippingMethod: (raw.shipping_methods?.length ?? 0) > 0,
    shippingAddress: raw.shipping_address
      ? {
          firstName: raw.shipping_address.first_name ?? null,
          lastName: raw.shipping_address.last_name ?? null,
          address1: raw.shipping_address.address_1 ?? null,
          address2: raw.shipping_address.address_2 ?? null,
          city: raw.shipping_address.city ?? null,
          province: raw.shipping_address.province ?? null,
          postalCode: raw.shipping_address.postal_code ?? null,
          phone: raw.shipping_address.phone ?? null,
        }
      : null,
  }
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId()
  if (!cartId) return null
  try {
    // Next's per-request fetch memoization dedupes identical GET requests —
    // including this exact URL — within a single render. That's wrong for
    // cart reads specifically: checkout's page load calls this again right
    // after attaching a shipping method and needs the real post-shipping
    // totals, not a cached pre-shipping snapshot. A unique header per call
    // keeps the request identity distinct so it always hits the network.
    const { cart } = await medusa.store.cart.retrieve(
      cartId,
      { fields: CART_FIELDS },
      { "x-request-time": Date.now().toString() }
    )
    return toCart(cart)
  } catch {
    return null
  }
}

export type UpdateQuantityResult = { success: true } | { success: false; error: string }

export async function updateLineItemQuantity(lineItemId: string, quantity: number): Promise<UpdateQuantityResult> {
  const cartId = await getCartId()
  if (!cartId) return { success: false, error: "No cart found." }
  try {
    if (quantity < 1) {
      await medusa.store.cart.deleteLineItem(cartId, lineItemId)
    } else {
      await medusa.store.cart.updateLineItem(cartId, lineItemId, { quantity })
    }
    return { success: true }
  } catch {
    // Most commonly: not enough stock for the requested quantity (e.g. a
    // one-of-one Original artwork).
    return { success: false, error: "That quantity isn't available for this item." }
  }
}

export async function removeLineItem(lineItemId: string) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart")
  await medusa.store.cart.deleteLineItem(cartId, lineItemId)
}

export type ShippingOption = { id: string; name: string; amount: number }

export async function getShippingOptions(): Promise<ShippingOption[]> {
  const cartId = await getCartId()
  if (!cartId) return []
  const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId })
  const options = shipping_options as unknown as { id: string; name: string; amount?: number }[]
  return options.map((o) => ({
    id: o.id,
    name: o.name,
    amount: o.amount ?? 0,
  }))
}

export async function setShippingMethod(optionId: string) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart")
  await medusa.store.cart.addShippingMethod(cartId, { option_id: optionId })
}

export type CheckoutAddress = {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  phone?: string
}

export async function setCheckoutDetails(email: string, address: CheckoutAddress) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart")
  const addressPayload = {
    first_name: address.firstName,
    last_name: address.lastName,
    address_1: address.address1,
    address_2: address.address2,
    city: address.city,
    province: address.province,
    postal_code: address.postalCode,
    phone: address.phone,
    country_code: COUNTRY_CODE,
  }
  await medusa.store.cart.update(cartId, {
    email,
    shipping_address: addressPayload,
    billing_address: addressPayload,
  })

  // Only one shipping option exists today — select it automatically as
  // part of setting checkout details, rather than a picker UI.
  const options = await getShippingOptions()
  if (options[0]) {
    await setShippingMethod(options[0].id)
  }
}

export async function createPaymentSession(): Promise<{ clientSecret: string }> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart")
  const { cart } = await medusa.store.cart.retrieve(cartId)
  const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart, {
    provider_id: "pp_stripe",
  })
  const sessions = payment_collection.payment_sessions as unknown as
    | { provider_id: string; data?: Record<string, unknown> }[]
    | undefined
  const session = sessions?.find((s) => s.provider_id === "pp_stripe")
  const clientSecret = session?.data?.client_secret as string | undefined
  if (!clientSecret) throw new Error("Stripe did not return a client secret")
  return { clientSecret }
}

export type CompleteOrderResult =
  | { type: "order"; orderId: string; displayId: number | null }
  | { type: "error"; message: string }

export async function completeOrder(): Promise<CompleteOrderResult> {
  const cartId = await getCartId()
  if (!cartId) return { type: "error", message: "No cart found." }
  const result = await medusa.store.cart.complete(cartId)
  if (result.type === "order") {
    const cookieStore = await cookies()
    cookieStore.delete(CART_COOKIE)
    return { type: "order", orderId: result.order.id, displayId: result.order.display_id ?? null }
  }
  return { type: "error", message: result.error?.message ?? "Could not complete the order." }
}

export type Order = {
  id: string
  displayId: number | null
  email: string | null
  total: number
  currencyCode: string
  items: { id: string; title: string; quantity: number; unitPrice: number }[]
}

type RawOrderLineItem = {
  id: string
  title: string
  product_title?: string | null
  quantity: number
  unit_price: number
}

type RawOrder = {
  id: string
  display_id?: number | null
  email?: string | null
  total: number
  currency_code: string
  items?: RawOrderLineItem[] | null
}

export async function getOrder(orderId: string): Promise<Order> {
  const { order } = await medusa.store.order.retrieve(orderId, {
    fields: "id,display_id,email,total,currency_code,*items,*shipping_address",
  })
  const raw = order as unknown as RawOrder
  return {
    id: raw.id,
    displayId: raw.display_id ?? null,
    email: raw.email ?? null,
    total: raw.total,
    currencyCode: raw.currency_code,
    items: (raw.items ?? []).map((item) => ({
      id: item.id,
      title: item.product_title ?? item.title,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
  }
}

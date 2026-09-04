"use server"

import { cookies } from "next/headers"
import { medusa, getRegion } from "./medusa"

const CART_COOKIE = "hgs_cart_id"

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

export async function addToCart(variantId: string, quantity = 1) {
  const cartId = await getOrCreateCartId()
  await medusa.store.cart.createLineItem(cartId, { variant_id: variantId, quantity })
  const { cart } = await medusa.store.cart.retrieve(cartId, { fields: "items.quantity" })
  return { itemCount: itemCount(cart) }
}

export async function getCartItemCount(): Promise<number> {
  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE)?.value
  if (!cartId) return 0
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId, { fields: "items.quantity" })
    return itemCount(cart)
  } catch {
    return 0
  }
}

import Link from "next/link"
import type { Metadata } from "next"
import { getCart, initShippingIfNeeded, getShippingChoice, createPaymentSession } from "@/lib/cart-actions"
import { formatPrice } from "@/lib/format"
import CartLineItem from "@/components/cart/CartLineItem"
import CheckoutForm from "@/components/checkout/CheckoutForm"

export const metadata: Metadata = {
  title: "Checkout | HaydenGoSeek",
}

export default async function CheckoutPage() {
  let cart = await getCart()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-24 text-center sm:px-8">
        <h1 className="text-2xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Browse the collection to find something you love.</p>
        <Link href="/shop" className="mt-8 inline-block bg-ink px-6 py-3.5 text-sm text-bg transition-opacity hover:opacity-90">
          Continue shopping
        </Link>
      </div>
    )
  }

  // Defaults any not-yet-covered shipping profile to Standard Shipping (see
  // initShippingIfNeeded) — a customer can switch to Local Pickup once the
  // form is visible. Re-fetching the cart afterward gives real (not
  // estimated) shipping/total figures.
  if (await initShippingIfNeeded()) {
    cart = await getCart()
  }
  if (!cart) return null

  const shippingChoice = await getShippingChoice()

  let clientSecret: string | null = null
  try {
    const session = await createPaymentSession()
    clientSecret = session.clientSecret
  } catch {
    clientSecret = null
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8">
      <h1 className="text-2xl">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-3">
        {clientSecret ? (
          // Stripe's <Elements> ignores a changed clientSecret after it first
          // mounts — key it so editing a line item's quantity (which creates a
          // fresh payment session with the new total) forces a clean remount.
          // CheckoutForm renders its fields as `display:contents`, so its two
          // sections (address, payment) land directly in this grid as the
          // first two columns rather than being wrapped in an extra box.
          <CheckoutForm key={clientSecret} clientSecret={clientSecret} shippingChoice={shippingChoice} />
        ) : (
          <p className="text-sm text-danger lg:col-span-2">
            We couldn&apos;t set up payment right now. Please refresh the page or try again shortly.
          </p>
        )}

        <div className="h-fit border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {cart.items.map((item) => (
            <CartLineItem key={item.id} item={item} currencyCode={cart!.currencyCode} />
          ))}

          <dl className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal, cart.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{shippingChoice.isPickupSelected ? "Free — pickup" : formatPrice(cart.shippingTotal, cart.currencyCode)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base">
              <dt>Total</dt>
              <dd>{formatPrice(cart.total, cart.currencyCode)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

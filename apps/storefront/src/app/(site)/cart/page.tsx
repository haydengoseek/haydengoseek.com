import Link from "next/link"
import type { Metadata } from "next"
import { getCart } from "@/lib/cart-actions"
import { formatPrice } from "@/lib/format"
import CartLineItem from "@/components/cart/CartLineItem"

export const metadata: Metadata = {
  title: "Your Cart | HaydenGoSeek",
}

export default async function CartPage() {
  const cart = await getCart()
  const items = cart?.items ?? []

  if (items.length === 0) {
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

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8">
      <h1 className="text-2xl">Your cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div>
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} currencyCode={cart!.currencyCode} />
          ))}
        </div>

        <div className="h-fit border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(cart!.subtotal, cart!.currencyCode)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Shipping</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 block w-full bg-ink py-3.5 text-center text-sm text-bg transition-opacity hover:opacity-90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

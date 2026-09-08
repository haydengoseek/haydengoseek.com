import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { getCart, getShippingOptions } from "@/lib/cart-actions"
import { formatPrice } from "@/lib/format"
import CheckoutForm from "@/components/checkout/CheckoutForm"

export const metadata: Metadata = {
  title: "Checkout | HaydenGoSeek",
}

export default async function CheckoutPage() {
  const cart = await getCart()
  if (!cart || cart.items.length === 0) redirect("/cart")

  const shippingOptions = await getShippingOptions()
  const estimatedShipping = shippingOptions[0]?.amount ?? 0
  const estimatedTotal = cart.subtotal + estimatedShipping

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8">
      <h1 className="text-2xl">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="lg:max-w-lg">
          <CheckoutForm />
        </div>

        <div className="h-fit border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <ul className="space-y-4 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span className="text-muted">
                  {item.title}
                  {item.variantTitle ? ` — ${item.variantTitle}` : ""} × {item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity, cart.currencyCode)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal, cart.currencyCode)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{formatPrice(estimatedShipping, cart.currencyCode)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base">
              <dt>Estimated total</dt>
              <dd>{formatPrice(estimatedTotal, cart.currencyCode)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

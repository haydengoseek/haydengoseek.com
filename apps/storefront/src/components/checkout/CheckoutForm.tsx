"use client"

import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import type { ShippingChoice } from "@/lib/cart-actions"
import CheckoutFields from "./CheckoutFields"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutForm({
  clientSecret,
  shippingChoice,
}: {
  clientSecret: string
  shippingChoice: ShippingChoice
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutFields shippingChoice={shippingChoice} />
    </Elements>
  )
}

"use client"

import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

export default function PaymentStep() {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setError(null)

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/confirmed` },
    })

    // Only reached if confirmation failed synchronously (e.g. card declined) —
    // on success Stripe navigates to return_url itself.
    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="mt-8 border-t border-line pt-8">
      <PaymentElement />

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="mt-8 w-full bg-ink py-3.5 text-sm text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Processing…" : "Place order"}
      </button>
    </form>
  )
}

"use client"

import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { setCheckoutDetails } from "@/lib/cart-actions"

const FIELDS = [
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: 2 },
  { name: "firstName", label: "First name", type: "text", autoComplete: "given-name", span: 1 },
  { name: "lastName", label: "Last name", type: "text", autoComplete: "family-name", span: 1 },
  { name: "address1", label: "Address", type: "text", autoComplete: "address-line1", span: 2 },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2", span: 1 },
  { name: "province", label: "State", type: "text", autoComplete: "address-level1", span: 1 },
  { name: "postalCode", label: "Postcode", type: "text", autoComplete: "postal-code", span: 1 },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", span: 1 },
] as const

export default function CheckoutFields() {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setError(null)

    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "")
    const address = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      address1: String(data.get("address1") ?? ""),
      city: String(data.get("city") ?? ""),
      province: String(data.get("province") ?? ""),
      postalCode: String(data.get("postalCode") ?? ""),
      phone: String(data.get("phone") ?? ""),
    }

    try {
      await setCheckoutDetails(email, address)
    } catch {
      setError("Something went wrong saving your details. Please check them and try again.")
      setIsSubmitting(false)
      return
    }

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
    // display:contents makes the form itself invisible to layout — its two
    // direct children become the actual grid items in the parent page's
    // 3-column grid (address / payment / summary), while still submitting
    // as a single form.
    <form onSubmit={handleSubmit} className="contents">
      <div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.span === 2 ? "col-span-2" : "col-span-1"}>
              <label
                htmlFor={`checkout-${field.name}`}
                className="block text-xs font-medium uppercase tracking-[0.08em] text-muted"
              >
                {field.label}
              </label>
              <input
                id={`checkout-${field.name}`}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                required={field.name !== "phone"}
                className="mt-4 w-full border-b border-line bg-transparent pb-3 text-lg tracking-[-0.01em] text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-ink focus-visible:ring-0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-8 lg:mt-0 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
        <PaymentElement />

        {error && <p className="mt-6 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={!stripe || isSubmitting}
          className="mt-8 w-full bg-ink py-3.5 text-sm text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Processing…" : "Place order"}
        </button>
      </div>
    </form>
  )
}

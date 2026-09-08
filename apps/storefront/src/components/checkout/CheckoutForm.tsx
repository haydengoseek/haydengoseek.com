"use client"

import { useState, useTransition } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { setCheckoutDetails, createPaymentSession } from "@/lib/cart-actions"
import PaymentStep from "./PaymentStep"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

export default function CheckoutForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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

    setError(null)
    startTransition(async () => {
      try {
        await setCheckoutDetails(email, address)
        const { clientSecret } = await createPaymentSession()
        setClientSecret(clientSecret)
      } catch {
        setError("Something went wrong setting up checkout. Please check your details and try again.")
      }
    })
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentStep />
      </Elements>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
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

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-8 w-full bg-ink py-3.5 text-sm text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Loading…" : "Continue to payment"}
      </button>
    </form>
  )
}

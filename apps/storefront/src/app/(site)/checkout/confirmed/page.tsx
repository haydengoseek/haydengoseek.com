import Link from "next/link"
import type { Metadata } from "next"
import OrderCompleter from "@/components/checkout/OrderCompleter"

export const metadata: Metadata = {
  title: "Order Confirmed | HaydenGoSeek",
}

export default async function CheckoutConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_status?: string; payment_intent?: string }>
}) {
  const { redirect_status, payment_intent } = await searchParams

  if (redirect_status && redirect_status !== "succeeded") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
        <h1 className="text-2xl">Payment not completed</h1>
        <p className="mt-2 text-sm text-muted">
          Your payment wasn&apos;t completed ({redirect_status}). No charge was made — please try again.
        </p>
        <Link href="/checkout" className="mt-8 inline-block bg-ink px-6 py-3.5 text-sm text-bg transition-opacity hover:opacity-90">
          Back to checkout
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-24 sm:px-8">
      <OrderCompleter paymentIntent={payment_intent} />
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { completeOrder, getOrder, type Order } from "@/lib/cart-actions"
import { formatPrice } from "@/lib/format"

type State =
  | { status: "loading" }
  | { status: "order"; displayId: number | null; order: Order }
  | { status: "error"; message: string; paymentIntent?: string }

export default function OrderCompleter({ paymentIntent }: { paymentIntent?: string }) {
  const [state, setState] = useState<State>({ status: "loading" })
  // completeOrder() deletes the cart cookie on success, so it must run exactly
  // once — a ref guard (not just the cleanup-based `cancelled` flag below) is
  // needed because React's Strict Mode double-invokes effects in development,
  // and a second real call would find the cart already gone.
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    // No unmount-cancellation guard here: this effect's single invocation is
    // already guaranteed by the ref above, and this page has no reason to
    // unmount mid-flight — a stray setState-after-unmount is harmless in
    // React 18+, whereas gating on a `cancelled` flag set by Strict Mode's
    // synchronous throwaway cleanup would discard this real call's result.
    ;(async () => {
      const result = await completeOrder()
      if (result.type === "error") {
        setState({ status: "error", message: result.message, paymentIntent })
        return
      }
      const order = await getOrder(result.orderId)
      setState({ status: "order", displayId: result.displayId, order })
    })()
    // Only ever run once, on mount — completeOrder() is not idempotent-safe to
    // retry automatically (e.g. re-running after the cart's already cleared).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.status === "loading") {
    return (
      <>
        <h1 className="text-2xl">Finalising your order…</h1>
        <p className="mt-2 text-sm text-muted">This will just take a moment.</p>
      </>
    )
  }

  if (state.status === "error") {
    return (
      <>
        <h1 className="text-2xl">There was a problem finalising your order</h1>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
        <p className="mt-2 text-sm text-muted">
          If you were charged, contact us at{" "}
          <a href="mailto:info@haydengoseek.com" className="text-ink underline">
            info@haydengoseek.com
          </a>
          {state.paymentIntent ? ` and reference payment ${state.paymentIntent}.` : "."}
        </p>
      </>
    )
  }

  const { order, displayId } = state

  return (
    <>
      <h1 className="text-2xl">Thank you for your order</h1>
      <p className="mt-2 text-sm text-muted">
        Order {displayId ? `#${displayId}` : ""} confirmed — a confirmation has been sent to {order.email}.
      </p>

      <ul className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span className="text-muted">
              {item.title} × {item.quantity}
            </span>
            <span>{formatPrice(item.unitPrice * item.quantity, order.currencyCode)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between border-t border-line pt-6 text-base">
        <span>Total</span>
        <span>{formatPrice(order.total, order.currencyCode)}</span>
      </div>

      <Link href="/shop" className="mt-12 inline-block bg-ink px-6 py-3.5 text-sm text-bg transition-opacity hover:opacity-90">
        Continue shopping
      </Link>
    </>
  )
}

"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { useCartDrawer } from "./CartDrawerContext"
import { formatPrice } from "@/lib/format"
import CartLineItem from "./CartLineItem"

export default function CartDrawer() {
  const { isOpen, close, cart, isLoading, refetch } = useCartDrawer()

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, close])

  const items = cart?.items ?? []

  return (
    <div aria-hidden={!isOpen} className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-bg shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="text-sm font-medium">Your cart</p>
          <button type="button" aria-label="Close cart" onClick={close} className="text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {isLoading && !cart ? (
            <p className="py-12 text-center text-sm text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <CartLineItem key={item.id} item={item} currencyCode={cart!.currencyCode} onMutate={refetch} />
            ))
          )}
        </div>

        {items.length > 0 && cart && (
          <div className="border-t border-line px-6 py-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(cart.subtotal, cart.currencyCode)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="mt-4 block w-full bg-ink py-3.5 text-center text-sm text-bg transition-opacity hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

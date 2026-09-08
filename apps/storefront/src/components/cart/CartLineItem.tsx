"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartLineItem as CartLineItemType } from "@/lib/cart-actions"
import { updateLineItemQuantity, removeLineItem } from "@/lib/cart-actions"
import { formatPrice } from "@/lib/format"

export default function CartLineItem({
  item,
  currencyCode,
  onMutate,
}: {
  item: CartLineItemType
  currencyCode: string
  /** Called after a successful quantity change/removal — for callers (like the
   * cart drawer) holding their own client-fetched copy of the cart that
   * router.refresh() (a server-component refresh) won't touch. */
  onMutate?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function changeQuantity(quantity: number) {
    setError(null)
    startTransition(async () => {
      const result = await updateLineItemQuantity(item.id, quantity)
      if (result.success) {
        router.refresh()
        onMutate?.()
      } else {
        setError(result.error)
      }
    })
  }

  function remove() {
    setError(null)
    startTransition(async () => {
      try {
        await removeLineItem(item.id)
        router.refresh()
        onMutate?.()
      } catch {
        setError("Couldn't remove this item — please try again.")
      }
    })
  }

  return (
    <div className="flex gap-4 border-b border-line py-6">
      <Link href={item.productHandle ? `/products/${item.productHandle}` : "/shop"} className="relative aspect-square w-24 shrink-0 overflow-hidden bg-surface">
        {item.thumbnail && (
          <Image src={item.thumbnail} alt={item.title} fill sizes="96px" className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-4">
          <div>
            <Link href={item.productHandle ? `/products/${item.productHandle}` : "/shop"} className="text-sm hover:text-muted">
              {item.title}
            </Link>
            {item.variantTitle && <p className="mt-1 text-xs text-muted">{item.variantTitle}</p>}
          </div>
          <p className="text-sm">{formatPrice(item.unitPrice * item.quantity, currencyCode)}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 border border-line px-2 py-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={isPending}
              onClick={() => changeQuantity(item.quantity - 1)}
              className="text-muted hover:text-ink disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-4 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isPending}
              onClick={() => changeQuantity(item.quantity + 1)}
              className="text-muted hover:text-ink disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Remove from cart"
            disabled={isPending}
            onClick={remove}
            className="text-muted hover:text-ink disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    </div>
  )
}

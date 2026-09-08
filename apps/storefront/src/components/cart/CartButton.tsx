"use client"

import { ShoppingBag } from "lucide-react"
import { useCartDrawer } from "./CartDrawerContext"

export default function CartButton({ itemCount }: { itemCount: number }) {
  const { open } = useCartDrawer()

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`${itemCount} items in cart`}
      className="relative flex items-center text-ink hover:text-muted"
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[0.625rem] text-bg">
          {itemCount}
        </span>
      )}
    </button>
  )
}

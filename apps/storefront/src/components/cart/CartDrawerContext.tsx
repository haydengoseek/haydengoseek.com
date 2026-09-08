"use client"

import { createContext, useContext, useCallback, useState, type ReactNode } from "react"
import { getCart, type Cart } from "@/lib/cart-actions"

type CartDrawerContextValue = {
  isOpen: boolean
  cart: Cart | null
  isLoading: boolean
  open: () => void
  close: () => void
  refetch: () => void
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null)

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(() => {
    setIsLoading(true)
    getCart()
      .then(setCart)
      .finally(() => setIsLoading(false))
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
    refetch()
  }, [refetch])

  const close = useCallback(() => setIsOpen(false), [])

  return (
    <CartDrawerContext.Provider value={{ isOpen, cart, isLoading, open, close, refetch }}>
      {children}
    </CartDrawerContext.Provider>
  )
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext)
  if (!ctx) throw new Error("useCartDrawer must be used within a CartDrawerProvider")
  return ctx
}

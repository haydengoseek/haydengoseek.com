"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ProductDetail, VariantOptionValues } from "@/lib/medusa"
import { getImageForOptions, isVariantPurchasable } from "@/lib/medusa"
import { formatPrice } from "@/lib/format"
import { addToCart } from "@/lib/cart-actions"
import ProductGallery from "./ProductGallery"

// Frame values render as colour swatches (they have an obvious visual
// swatch); Type and Size render as text pills — matching how each option
// actually reads at a glance.
const SWATCH_OPTION_TITLES = new Set(["Frame"])
const FRAME_SWATCH_COLORS: Record<string, string> = {
  Oak: "#b98a52",
  White: "#f5f4f2",
  Black: "#1a1a1a",
}

function firstPurchasableVariant(variants: ProductDetail["variants"]) {
  return variants.find((v) => isVariantPurchasable(v)) ?? variants[0]
}

export default function ProductInteractive({ product }: { product: ProductDetail }) {
  const router = useRouter()
  const [selected, setSelected] = useState<VariantOptionValues>(
    () => firstPurchasableVariant(product.variants)?.options ?? {}
  )
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)

  const activeVariant = useMemo(() => {
    return product.variants.find((v) =>
      Object.entries(selected).every(([key, value]) => v.options[key] === value)
    )
  }, [product.variants, selected])

  const autoImageUrl = useMemo(
    () => getImageForOptions(product.images, selected) ?? product.images[0]?.url,
    [product.images, selected]
  )
  const autoIndex = Math.max(
    0,
    product.images.findIndex((img) => img.url === autoImageUrl)
  )

  // null = "follow the variant selection" (the common case); a number means
  // the shopper is browsing the gallery manually — picking a Frame/Type still
  // resets this so the photo always jumps back to match what they chose.
  // Adjusted during render (React's recommended pattern for state that should
  // reset when a derived value changes) rather than in an effect, so the
  // reset lands in the same render instead of a follow-up one.
  const [manualIndex, setManualIndex] = useState<number | null>(null)
  const [prevAutoImageUrl, setPrevAutoImageUrl] = useState(autoImageUrl)
  if (autoImageUrl !== prevAutoImageUrl) {
    setPrevAutoImageUrl(autoImageUrl)
    setManualIndex(null)
  }
  const activeIndex = manualIndex ?? autoIndex

  // Not every Type/Size/Frame combination exists as a variant (e.g. "Original"
  // only ever pairs with one Frame) — merging the clicked option into `selected`
  // naively can land on a combination with no matching variant at all, leaving
  // price/add-to-cart dead with no way out. Instead, always resolve to a real
  // variant: prefer an exact match with the rest of the current selection kept,
  // otherwise fall back to whichever matching variant keeps the most of it.
  function selectOption(title: string, value: string) {
    setAdded(false)
    setSelected((prev) => {
      const candidate = { ...prev, [title]: value }
      const exact = product.variants.find((v) =>
        Object.entries(candidate).every(([k, val]) => v.options[k] === val)
      )
      if (exact) return candidate

      const matches = product.variants.filter((v) => v.options[title] === value)
      if (matches.length === 0) return prev

      let best = matches[0]
      let bestScore = -1
      for (const v of matches) {
        const score = Object.entries(prev).filter(([k, val]) => k !== title && v.options[k] === val).length
        if (score > bestScore) {
          bestScore = score
          best = v
        }
      }
      return best.options
    })
  }

  // Whether every variant carrying this option value is sold out — checked
  // independently of the *other* currently selected options, since e.g.
  // Original only ever pairs with one particular Size/Frame that may not be
  // the one currently selected for Canvas/Paper Print.
  function isValueSoldOut(title: string, value: string) {
    const variantsWithValue = product.variants.filter((v) => v.options[title] === value)
    if (variantsWithValue.length === 0) return false
    return variantsWithValue.every((v) => !isVariantPurchasable(v))
  }

  function handleAddToCart() {
    if (!activeVariant) return
    startTransition(async () => {
      await addToCart(activeVariant.id, 1)
      setAdded(true)
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
      <ProductGallery
        images={product.images}
        alt={product.title}
        activeIndex={activeIndex}
        onSelect={setManualIndex}
      />

      <div className="lg:max-w-md">
        <h1 className="text-2xl">{product.title}</h1>
        <p className="mt-2 text-lg">
          {activeVariant ? formatPrice(activeVariant.price, product.currencyCode) : "—"}
        </p>

        <div className="mt-8 space-y-6">
          {product.options.map((option) => {
            const isSwatch = SWATCH_OPTION_TITLES.has(option.title)
            const visibleValues = option.values.filter((value) => {
              // Only ever hide a sold-out *Original* — prints stay listed
              // regardless of stock (they're made to order).
              if (option.title !== "Type" || value !== "Original") return true
              return !isValueSoldOut(option.title, value)
            })
            if (visibleValues.length === 0) return null

            return (
              <div key={option.id}>
                <p className="text-sm text-muted">{option.title}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {visibleValues.map((value) => {
                    const active = selected[option.title] === value
                    if (isSwatch) {
                      const isNoFrame = value === "No frame"
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => selectOption(option.title, value)}
                          title={value}
                          aria-label={value}
                          aria-pressed={active}
                          className={`h-8 w-8 rounded-full border ${
                            active ? "ring-2 ring-ink ring-offset-2 ring-offset-bg" : "border-line"
                          } ${isNoFrame ? "border-dashed" : ""}`}
                          style={
                            isNoFrame
                              ? {
                                  background:
                                    "repeating-linear-gradient(45deg, var(--color-line), var(--color-line) 2px, transparent 2px, transparent 6px)",
                                }
                              : { backgroundColor: FRAME_SWATCH_COLORS[value] ?? "#ccc" }
                          }
                        />
                      )
                    }
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectOption(option.title, value)}
                        aria-pressed={active}
                        className={`border px-3 py-1.5 text-sm ${
                          active ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
                        }`}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!activeVariant || isPending}
          className="mt-8 w-full bg-ink py-3.5 text-sm text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : added ? "Added to cart" : "Add to cart"}
        </button>

        <dl className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex justify-between">
            <dt>Returns</dt>
            <dd>See shipping &amp; returns</dd>
          </div>
        </dl>

        {product.description && (
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-sm text-muted">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

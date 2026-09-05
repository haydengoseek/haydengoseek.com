"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ScrollReveal } from "@/lib/motion-variants"
import type { ProductListItem } from "@/lib/medusa"
import { formatPriceRange } from "@/lib/format"

type Honor = [string, string]

const DEFAULT_HONORS: Honor[] = [
  ["800+", "Songs written across a career in music"],
  ["18+", "Years spent framing artwork by hand"],
  ["14", "Original one-of-one artworks available now"],
  ["1", "Artist doing every step, start to finish"],
]

const PER_PAGE = 4
const EASE = [0.22, 1, 0.36, 1] as const

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

/**
 * Simplified from the earlier drag-to-browse rail into a paginated
 * carousel: square thumbnails, four per page, advanced with prev/next.
 */
export default function ArtworksCarousel({
  eyebrow = "The collection",
  title = "Welcome to the creative world of HaydenGoSeek.",
  products,
  honors = DEFAULT_HONORS,
}: {
  eyebrow?: string
  title?: string
  products: ProductListItem[]
  honors?: Honor[]
}) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 1])
  const totalPages = Math.ceil(products.length / PER_PAGE)

  const paginate = (step: number) => setPage(([p]) => [(p + step + totalPages) % totalPages, step])

  if (products.length === 0) return null

  const visible = products.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
        <ScrollReveal className="max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{eyebrow}</p>
          <h2 className="mt-6 text-[clamp(2rem,5vw,4.25rem)] tracking-[-0.02em] text-ink">{title}</h2>
        </ScrollReveal>

        <div className="relative mt-16 overflow-hidden">
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EASE }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
            >
              {visible.map((product) => (
                <Link key={product.id} href={`/products/${product.handle}`} className="group">
                  <div className="relative aspect-square overflow-hidden bg-bg">
                    {product.thumbnail && (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 text-sm">{product.title}</h3>
                  <p className="mt-1 text-sm text-muted">{formatPriceRange(product.priceRange.min, product.priceRange.max)}</p>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
              {String(page + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous"
                className="rounded-full border border-line px-5 py-2.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] transition-colors hover:border-ink hover:bg-ink hover:text-bg"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next"
                className="rounded-full border border-line px-5 py-2.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] transition-colors hover:border-ink hover:bg-ink hover:text-bg"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Honors */}
        <div className="mt-20">
          <ul className="grid gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {honors.map(([figure, note]) => (
              <ScrollReveal as="li" key={figure}>
                <p className="text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.02em] text-ink">{figure}</p>
                <p className="mt-3 max-w-[28ch] text-sm leading-snug text-muted">{note}</p>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

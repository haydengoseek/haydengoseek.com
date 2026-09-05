"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "motion/react"
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

/**
 * Ported from Claude-Agency-Website-Build's module 88 (Content — Drag
 * Slider), restyled into this site's palette and wired to real Medusa
 * products instead of placeholder cards — this is the "about the practice"
 * section repurposed to showcase Hayden's actual artworks.
 */
export default function ArtworksDragSlider({
  eyebrow = "The collection",
  title = "Built by hand, not by machine",
  products,
  honors = DEFAULT_HONORS,
}: {
  eyebrow?: string
  title?: string
  products: ProductListItem[]
  honors?: Honor[]
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [maxDrag, setMaxDrag] = useState(0)
  const [hovering, setHovering] = useState(false)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springX = useSpring(cursorX, { stiffness: 480, damping: 40, mass: 0.4 })
  const springY = useSpring(cursorY, { stiffness: 480, damping: 40, mass: 0.4 })

  useEffect(() => {
    const measure = () => {
      const rail = railRef.current
      const track = trackRef.current
      if (!rail || !track) return
      setMaxDrag(Math.max(0, track.scrollWidth - rail.clientWidth))
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  if (products.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
        <ScrollReveal className="max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{eyebrow}</p>
          <h2 className="mt-6 text-[clamp(2rem,5vw,4.25rem)] tracking-[-0.02em] text-ink">{title}</h2>
        </ScrollReveal>
      </div>

      {/* Drag rail */}
      <div
        ref={railRef}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onPointerMove={(e) => {
          const box = railRef.current?.getBoundingClientRect()
          if (!box) return
          cursorX.set(e.clientX - box.left)
          cursorY.set(e.clientY - box.top)
        }}
        className="relative mt-16 overflow-hidden"
      >
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.06}
          dragMomentum
          className="flex w-max cursor-grab gap-4 px-4 active:cursor-grabbing sm:px-8"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="group w-[76vw] shrink-0 select-none sm:w-[46vw] lg:w-[30vw] xl:w-[26vw]"
            >
              <div className="relative aspect-4/5 overflow-hidden bg-bg">
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 76vw, (max-width: 1024px) 46vw, 26vw"
                    draggable={false}
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                )}
              </div>
              <h3 className="mt-4 text-sm">{product.title}</h3>
              <p className="mt-1 text-sm text-muted">{formatPriceRange(product.priceRange.min, product.priceRange.max)}</p>
            </Link>
          ))}
        </motion.div>

        {/* Cursor-following drag tag */}
        <motion.div
          style={{ x: springX, y: springY, opacity: hovering ? 1 : 0 }}
          className="pointer-events-none absolute left-0 top-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink px-4 py-2 text-[0.625rem] font-medium uppercase leading-none tracking-[0.08em] text-bg transition-opacity duration-300 md:block"
        >
          Drag
        </motion.div>
      </div>

      {/* Honors */}
      <div className="mx-auto mt-20 max-w-[1600px] px-4 sm:px-8">
        <ul className="grid gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {honors.map(([figure, note]) => (
            <ScrollReveal as="li" key={figure}>
              <p className="text-[clamp(2rem,3.4vw,3rem)] tracking-[-0.02em] text-ink">{figure}</p>
              <p className="mt-3 max-w-[28ch] text-sm leading-snug text-muted">{note}</p>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

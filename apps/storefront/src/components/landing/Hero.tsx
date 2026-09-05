import Image from "next/image"
import Link from "next/link"
import { Reveal, StaggerGroup, ScrollReveal } from "@/lib/motion-variants"
import type { ProductListItem } from "@/lib/medusa"

type HeroProps = {
  eyebrow?: string
  heading?: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
  products?: ProductListItem[]
}

const DEFAULT_PRODUCTS: ProductListItem[] = []

export default function Hero({
  eyebrow = "Gold Coast, Australia",
  heading = "Art & Music",
  subheading = "Original artworks and museum-quality fine art prints by Hayden Andrews.",
  ctaLabel = "Shop Art",
  ctaHref = "/shop",
  products = DEFAULT_PRODUCTS,
}: HeroProps) {
  const tiles = products.slice(0, 3)

  return (
    <section className="px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal effect="A" as="p" className="mb-4 text-sm tracking-wide text-muted uppercase">
            {eyebrow}
          </Reveal>
          <Reveal effect="A" as="h1" className="text-balance text-5xl tracking-tight text-ink sm:text-6xl">
            {heading}
          </Reveal>
          <Reveal
            effect="A"
            as="p"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mt-6 max-w-md text-lg text-muted"
          >
            {subheading}
          </Reveal>
          <Reveal
            effect="A"
            as="div"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-8"
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide uppercase hover:text-muted"
            >
              {ctaLabel} →
            </Link>
          </Reveal>
        </div>

        {tiles.length > 0 && (
          <StaggerGroup className="grid grid-cols-2 grid-rows-2 gap-4">
            {tiles.map((product, i) => (
              <ScrollReveal
                key={product.id}
                effect="E"
                className={
                  i === 0
                    ? "relative col-span-2 aspect-2/1 overflow-hidden bg-surface"
                    : "relative aspect-square overflow-hidden bg-surface"
                }
              >
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </ScrollReveal>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  )
}

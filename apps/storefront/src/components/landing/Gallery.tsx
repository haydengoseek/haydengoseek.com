import Image from "next/image"
import { ScrollReveal, ParallaxImage } from "@/lib/motion-variants"
import type { ProductListItem } from "@/lib/medusa"

const DEFAULT_PRODUCTS: ProductListItem[] = []

export default function Gallery({
  heading = "Recent work",
  products = DEFAULT_PRODUCTS,
}: {
  heading?: string
  products?: ProductListItem[]
}) {
  const images = products.slice(0, 3)
  if (images.length === 0) return null

  const strengths = [40, 80, 40]

  return (
    <section className="overflow-hidden border-t border-line px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1600px]">
        <ScrollReveal effect="A" as="h2" className="mb-12 text-3xl tracking-tight text-ink">
          {heading}
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {images.map((product, i) => (
            <ParallaxImage
              key={product.id}
              strength={strengths[i] ?? 40}
              className={`relative aspect-3/4 bg-surface ${i === 1 ? "sm:mt-10" : ""}`}
            >
              {product.thumbnail && (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              )}
            </ParallaxImage>
          ))}
        </div>
      </div>
    </section>
  )
}

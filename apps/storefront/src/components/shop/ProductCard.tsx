import Image from "next/image"
import Link from "next/link"
import type { ProductListItem } from "@/lib/medusa"
import { formatPriceRange } from "@/lib/format"

export default function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-surface">
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="pt-3">
        <p className="text-sm">{product.title}</p>
        <p className="text-sm text-muted">{formatPriceRange(product.priceRange.min, product.priceRange.max)}</p>
        {product.variantCount > 1 && (
          <p className="text-xs text-muted">{product.variantCount} options</p>
        )}
      </div>
    </Link>
  )
}

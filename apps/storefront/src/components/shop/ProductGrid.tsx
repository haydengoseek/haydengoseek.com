import type { ProductListItem } from "@/lib/medusa"
import ProductCard from "./ProductCard"

export default function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return <p className="py-24 text-center text-sm text-muted">No artworks found.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

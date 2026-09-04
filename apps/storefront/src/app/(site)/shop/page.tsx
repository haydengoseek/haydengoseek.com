import Link from "next/link"
import type { Metadata } from "next"
import { listProducts, listCategories } from "@/lib/medusa"
import ProductGrid from "@/components/shop/ProductGrid"

export const metadata: Metadata = {
  title: "Shop | HaydenGoSeek",
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const [products, categories] = await Promise.all([
    listProducts({ categoryHandle: category }),
    listCategories(),
  ])

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8">
      <h1 className="text-2xl">All artworks</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Original paintings, museum-quality fine art prints and handcrafted framing.
      </p>

      <nav className="mt-8 flex gap-6 border-b border-line pb-4 text-sm">
        <Link href="/shop" className={!category ? "text-ink" : "text-muted hover:text-ink"}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.handle}`}
            className={category === c.handle ? "text-ink" : "text-muted hover:text-ink"}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  )
}

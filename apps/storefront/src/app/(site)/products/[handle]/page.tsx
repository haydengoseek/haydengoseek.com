import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductByHandle, listProducts } from "@/lib/medusa"
import ProductInteractive from "@/components/shop/ProductInteractive"
import ProductGrid from "@/components/shop/ProductGrid"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return {}
  return { title: `${product.title} | HaydenGoSeek` }
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  const category = product.categories[0]
  const related = (await listProducts({ categoryHandle: category?.handle })).filter(
    (p) => p.handle !== product.handle
  )

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        {category && (
          <>
            {" / "}
            <Link href={`/shop?category=${category.handle}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.title}</span>
      </nav>

      <ProductInteractive product={product} />

      {related.length > 0 && (
        <section className="mt-24 border-t border-line pt-12">
          <h2 className="text-lg">You might also like</h2>
          <div className="mt-8">
            <ProductGrid products={related.slice(0, 4)} />
          </div>
        </section>
      )}
    </div>
  )
}

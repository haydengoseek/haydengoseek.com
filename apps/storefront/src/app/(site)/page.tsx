import Image from "next/image"
import Link from "next/link"
import { listProducts } from "@/lib/medusa"
import { getHomePage, getFaqItems } from "@/lib/sanity"
import ProductGrid from "@/components/shop/ProductGrid"

export default async function HomePage() {
  const [products, homePage, faqItems] = await Promise.all([
    listProducts(),
    getHomePage(),
    getFaqItems(),
  ])

  const featured = products.slice(0, 4)
  const heroImage = featured[0]?.thumbnail

  return (
    <div>
      <section className="relative aspect-[4/5] w-full overflow-hidden bg-surface sm:aspect-[16/9]">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 border-t border-line bg-bg/90 px-4 py-3 text-sm sm:px-8">
          {homePage?.heading ?? "Original artworks & fine art prints"}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8">
        <p className="mb-8 text-sm text-muted">
          {homePage?.subheading ??
            "Original artworks, museum-quality fine art prints and handcrafted framing, all created under one roof by Hayden Andrews."}
        </p>
        <ProductGrid products={featured} />
        <Link href="/shop" className="mt-10 inline-block border-b border-ink text-sm">
          Shop all artworks →
        </Link>
      </section>

      <section className="grid grid-cols-1 border-t border-line sm:grid-cols-3">
        {[
          { title: "Original Artworks", desc: "Framed original works on canvas", href: "/shop" },
          { title: "Framed Prints", desc: "Selected originals available to print & frame", href: "/shop" },
          { title: "Limited Editions", desc: "Limited edition prints", href: "/shop" },
        ].map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="border-b border-line p-8 hover:bg-surface sm:border-b-0 sm:border-l sm:first:border-l-0"
          >
            <p className="text-sm">{c.title}</p>
            <p className="mt-1 text-sm text-muted">{c.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-[1600px] border-t border-line px-4 py-16 sm:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Hayden Andrews, known artistically as HaydenGoSeek, is a Gold Coast-based artist, musician,
          songwriter and educator whose work is inspired by connection, storytelling and the beauty found
          in everyday life. He personally creates, scans, prints and frames his own artworks, offering
          collectors a rare opportunity to purchase pieces crafted entirely under the vision and care of
          the original artist.
        </p>
      </section>

      {faqItems.length > 0 && (
        <section id="faq" className="mx-auto max-w-[1600px] border-t border-line px-4 py-16 sm:px-8">
          <h2 className="text-lg">Frequently asked questions</h2>
          <dl className="mt-6 max-w-2xl divide-y divide-line">
            {faqItems.map((item) => (
              <div key={item.question} className="py-4">
                <dt className="text-sm">{item.question}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}

import { listProducts } from "@/lib/medusa"
import { getHomePage, getFaqItems, getArtistBio } from "@/lib/sanity"
import Hero from "@/components/landing/Hero"
import CategoryGrid from "@/components/landing/CategoryGrid"
import Gallery from "@/components/landing/Gallery"
import About from "@/components/landing/About"
import Faq from "@/components/landing/Faq"
import ClosingCta from "@/components/landing/ClosingCta"

export default async function HomePage() {
  const [products, homePage, faqItems, artistBio] = await Promise.all([
    listProducts(),
    getHomePage(),
    getFaqItems(),
    getArtistBio(),
  ])

  const categories = homePage?.collectionTeasers?.length
    ? homePage.collectionTeasers.map((teaser) => ({
        title: teaser.title,
        description: teaser.description ?? "",
        href: teaser.medusaCategoryHandle ? `/shop?category=${teaser.medusaCategoryHandle}` : "/shop",
      }))
    : undefined

  return (
    <div>
      <Hero
        heading={homePage?.heading}
        subheading={homePage?.subheading ?? undefined}
        products={products}
      />
      <CategoryGrid categories={categories} />
      <Gallery products={products.slice(3)} />
      <About name={artistBio?.name ?? undefined} bio={artistBio?.bio} portrait={artistBio?.portrait} />
      {homePage?.showFaqSection !== false && <Faq items={faqItems.length > 0 ? faqItems : undefined} />}
      <ClosingCta />
    </div>
  )
}

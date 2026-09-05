import { listProducts, type ProductListItem } from "@/lib/medusa"
import { getHomePage, getFaqItems, getArtistBio, urlForImage } from "@/lib/sanity"
import { portableTextToPlainText } from "@/lib/portableText"
import HeroCinematic from "@/components/landing/HeroCinematic"
import ArtworksDragSlider from "@/components/landing/ArtworksDragSlider"
import StatsScroller from "@/components/landing/StatsScroller"
import TeamSlider from "@/components/landing/TeamSlider"
import Faq from "@/components/landing/Faq"
import ContactSection from "@/components/landing/ContactSection"

// Cycles through products with a thumbnail so a section always gets the
// image count it asks for, even if the catalog has fewer products than that.
function pickImages(products: ProductListItem[], count: number, offset = 0): string[] {
  const withThumbs = products.filter((p): p is ProductListItem & { thumbnail: string } => !!p.thumbnail)
  if (withThumbs.length === 0) return []
  return Array.from({ length: count }, (_, i) => withThumbs[(offset + i) % withThumbs.length].thumbnail)
}

export default async function HomePage() {
  const [products, homePage, faqItems, artistBio] = await Promise.all([
    listProducts(),
    getHomePage(),
    getFaqItems(),
    getArtistBio(),
  ])

  const statsBackdrops = pickImages(products, 3, 5)

  return (
    <div>
      {/* All three hero images are Hayden's real artwork photography
          (optimized, Weavings rotated to landscape — see public/hero/). */}
      <HeroCinematic
        revealStatement={homePage?.subheading ?? undefined}
        images={{
          backdrop: "/hero/my-friends.jpg",
          insetReveal: "/hero/weavings.jpg",
          closing: "/hero/haydo-home.jpg",
        }}
      />

      <ArtworksDragSlider products={products} />

      <StatsScroller backdrops={statsBackdrops} />

      <TeamSlider
        members={[
          {
            name: (artistBio?.name ?? "Hayden Andrews").split(" "),
            role: "Artist & Musician",
            image: artistBio?.portrait ? urlForImage(artistBio.portrait).width(1200).url() : "",
            bio:
              portableTextToPlainText(artistBio?.bio) ||
              "A Gold Coast-based artist, musician, songwriter and educator whose work is inspired by connection, storytelling and the beauty found in everyday life. He personally creates, scans, prints and frames every piece himself.",
          },
        ]}
      />

      {homePage?.showFaqSection !== false && <Faq items={faqItems.length > 0 ? faqItems : undefined} />}

      <ContactSection />
    </div>
  )
}

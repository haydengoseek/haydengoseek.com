import { listProducts } from "@/lib/medusa"
import { getHomePage, getFaqItems, getArtistBio, urlForImage } from "@/lib/sanity"
import { portableTextToPlainText } from "@/lib/portableText"
import HeroCinematic from "@/components/landing/HeroCinematic"
import ArtworksCarousel from "@/components/landing/ArtworksCarousel"
import TeamSlider from "@/components/landing/TeamSlider"
import Faq from "@/components/landing/Faq"
import ContactSection from "@/components/landing/ContactSection"

export default async function HomePage() {
  const [products, homePage, faqItems, artistBio] = await Promise.all([
    listProducts(),
    getHomePage(),
    getFaqItems(),
    getArtistBio(),
  ])

  return (
    <div>
      {/* All three hero images are Hayden's real artwork photography
          (optimized, Weavings rotated to landscape — see public/hero/). */}
      <HeroCinematic
        revealStatement={homePage?.subheading ?? undefined}
        images={{
          backdrop: "/hero/my-friends.jpg",
          insetReveal: "/hero/fossil.jpg",
          closing: "/hero/haydo-home.jpg",
        }}
      />

      <ArtworksCarousel products={products} />

      {/* Stats section removed for now (kept on file — src/components/landing/StatsScroller.tsx — for later). */}

      <TeamSlider
        members={[
          {
            name: (artistBio?.name ?? "Hayden Andrews").split(" "),
            role: "Artist & Musician",
            image: artistBio?.portrait ? urlForImage(artistBio.portrait).width(1200).url() : "/team/hayden.jpg",
            bio:
              portableTextToPlainText(artistBio?.bio) ||
              "Hayden Andrews, known artistically as HaydenGoSeek, is a Gold Coast-based artist, musician, songwriter and educator whose work is inspired by connection, storytelling and the beauty found in everyday life. Having written more than 800 songs, toured internationally and had music featured in film, television and advertising, Hayden brings the same creative depth to his visual art. He also teaches songwriting at HOTA and the Queensland Creative Academy. What makes his work unique is that he personally creates, scans, prints and frames his own artworks, offering collectors a rare opportunity to purchase pieces that have been crafted entirely under the vision and care of the original artist.",
          },
        ]}
      />

      {homePage?.showFaqSection !== false && <Faq items={faqItems.length > 0 ? faqItems : undefined} />}

      <ContactSection />
    </div>
  )
}

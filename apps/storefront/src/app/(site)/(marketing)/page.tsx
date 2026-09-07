import { listProducts } from "@/lib/medusa"
import { getHomePage, getFaqItems, getArtistBio, urlForImage } from "@/lib/sanity"
import { portableTextToPlainText } from "@/lib/portableText"
import HeroCinematic from "@/components/landing/HeroCinematic"
import ArtworksCarousel from "@/components/landing/ArtworksCarousel"
import TeamSlider from "@/components/landing/TeamSlider"
import Faq from "@/components/landing/Faq"
import ContactSection from "@/components/landing/ContactSection"

// Real current-site copy, kept as the default whenever a Sanity field is left
// blank — see sanity/schemaTypes/documents/homePage.ts for the matching shape.
const FALLBACK_HERO = {
  eyebrow: "Gold Coast, Australia",
  zoomHeading: "Original artworks and museum-quality fine art prints by Hayden Andrews.",
  revealLabel: "About Hayden",
  revealStatement:
    "Explore original artworks, museum-quality fine art prints and handcrafted framing, all created under one roof. Inspired by a lifetime of music, creativity and storytelling, each piece is professionally scanned, printed and framed by Hayden himself, ensuring every artwork is presented exactly as intended from the first brushstroke to the finished piece on your wall.",
  ctaLabel: "Shop Art",
  ctaHref: "/shop",
  // Hayden's real artwork photography (optimized, Weavings rotated to landscape).
  images: {
    backdrop: "/hero/my-friends.jpg",
    insetReveal: "/hero/fossil.jpg",
    closing: "/hero/haydo-home.jpg",
  },
}

const FALLBACK_ARTIST_BIO =
  "Hayden Andrews, known artistically as HaydenGoSeek, is a Gold Coast-based artist, musician, songwriter and educator whose work is inspired by connection, storytelling and the beauty found in everyday life. Having written more than 800 songs, toured internationally and had music featured in film, television and advertising, Hayden brings the same creative depth to his visual art. He also teaches songwriting at HOTA and the Queensland Creative Academy. What makes his work unique is that he personally creates, scans, prints and frames his own artworks, offering collectors a rare opportunity to purchase pieces that have been crafted entirely under the vision and care of the original artist."

const FALLBACK_ARTIST_ROLE = "Artist & Musician"

export default async function HomePage() {
  const [products, homePage, faqItems, artistBio] = await Promise.all([
    listProducts(),
    getHomePage(),
    getFaqItems(),
    getArtistBio(),
  ])

  const hero = homePage?.hero
  const cta = hero?.cta?.url ? hero.cta : { label: FALLBACK_HERO.ctaLabel, url: FALLBACK_HERO.ctaHref }

  return (
    <div>
      <HeroCinematic
        eyebrow={hero?.eyebrow || FALLBACK_HERO.eyebrow}
        zoomHeading={hero?.zoomHeading || FALLBACK_HERO.zoomHeading}
        revealLabel={hero?.revealLabel || FALLBACK_HERO.revealLabel}
        revealStatement={hero?.revealStatement || FALLBACK_HERO.revealStatement}
        ctaLabel={cta.label}
        ctaHref={cta.url}
        images={{
          backdrop: hero?.backdropImage ? urlForImage(hero.backdropImage).width(1920).url() : FALLBACK_HERO.images.backdrop,
          insetReveal: hero?.insetRevealImage
            ? urlForImage(hero.insetRevealImage).width(1920).url()
            : FALLBACK_HERO.images.insetReveal,
          closing: hero?.closingImage ? urlForImage(hero.closingImage).width(1920).url() : FALLBACK_HERO.images.closing,
        }}
      />

      <ArtworksCarousel eyebrow={homePage?.artworksCarousel?.eyebrow || undefined} title={homePage?.artworksCarousel?.heading || undefined} products={products} />

      {/* Stats section removed for now (kept on file — src/components/landing/StatsScroller.tsx — for later). */}

      <TeamSlider
        eyebrow={homePage?.teamSlider?.eyebrow || undefined}
        members={[
          {
            name: (artistBio?.name ?? "Hayden Andrews").split(" "),
            role: artistBio?.role || FALLBACK_ARTIST_ROLE,
            image: artistBio?.portrait ? urlForImage(artistBio.portrait).width(1200).url() : "/team/hayden.jpg",
            bio: portableTextToPlainText(artistBio?.bio) || FALLBACK_ARTIST_BIO,
          },
        ]}
      />

      {homePage?.faqSection?.showSection !== false && (
        <Faq heading={homePage?.faqSection?.heading || undefined} items={faqItems.length > 0 ? faqItems : undefined} />
      )}

      <ContactSection
        eyebrow={homePage?.contactSection?.eyebrow || undefined}
        lines={homePage?.contactSection?.headingLines?.length ? homePage.contactSection.headingLines : undefined}
        note={homePage?.contactSection?.note || undefined}
        directEmail={homePage?.contactSection?.directEmail || undefined}
        studioAddress={homePage?.contactSection?.studioAddress || undefined}
      />
    </div>
  )
}

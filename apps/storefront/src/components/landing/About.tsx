import Image from "next/image"
import Link from "next/link"
import { ScrollReveal } from "@/lib/motion-variants"
import RichText from "@/components/RichText"
import type { PortableTextBlock } from "@portabletext/types"
import { urlForImage } from "@/lib/sanity"
import type { SanityImageSource } from "@sanity/image-url"

const DEFAULT_BIO = [
  "Hayden Andrews, known artistically as HaydenGoSeek, is a Gold Coast-based artist, musician, songwriter and educator whose work is inspired by connection, storytelling and the beauty found in everyday life. Having written more than 800 songs, toured internationally and had music featured in film, television and advertising, Hayden brings the same creative depth to his visual art. He also teaches songwriting at HOTA and the Queensland Creative Academy.",
  "What makes his work unique is that he personally creates, scans, prints and frames his own artworks, offering collectors a rare opportunity to purchase pieces that have been crafted entirely under the vision and care of the original artist.",
]

export default function About({
  eyebrow = "The Artist",
  name = "Hayden Andrews",
  bio,
  portrait,
  ctaLabel = "Say G'day",
  ctaHref = "/contact",
}: {
  eyebrow?: string
  name?: string
  bio?: PortableTextBlock[] | null
  portrait?: SanityImageSource | null
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <section className="border-t border-line px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {portrait && (
          <ScrollReveal effect="E" className="relative order-2 aspect-4/3 w-full overflow-hidden bg-surface lg:order-1">
            <Image src={urlForImage(portrait).width(1200).url()} alt={name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </ScrollReveal>
        )}

        <div className={portrait ? "order-1 lg:order-2" : ""}>
          <ScrollReveal effect="A" as="p" className="mb-4 text-sm tracking-wide text-muted uppercase">
            {eyebrow}
          </ScrollReveal>
          <ScrollReveal effect="B" as="h2" className="text-balance text-3xl tracking-tight text-ink sm:text-4xl">
            {name}
          </ScrollReveal>
          <ScrollReveal effect="A">
            <RichText value={bio} fallback={DEFAULT_BIO} className="mt-6 max-w-xl text-lg text-muted" />
          </ScrollReveal>
          <ScrollReveal effect="A" className="mt-8">
            <Link href={ctaHref} className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide uppercase hover:text-muted">
              {ctaLabel} →
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

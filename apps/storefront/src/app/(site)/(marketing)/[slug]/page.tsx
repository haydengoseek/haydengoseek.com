import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPageBySlug } from "@/lib/sanity"
import { ScrollReveal } from "@/lib/motion-variants"
import RichText from "@/components/RichText"

// Only these three slugs resolve — anything else 404s rather than exposing an
// open-ended dynamic page route.
const KNOWN_SLUGS = ["about", "contact", "shipping-returns"]

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!KNOWN_SLUGS.includes(slug)) return {}
  const page = await getPageBySlug(slug)
  return { title: `${page?.title ?? slug} | HaydenGoSeek` }
}

export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!KNOWN_SLUGS.includes(slug)) notFound()

  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-24 sm:px-8 md:py-32">
      <ScrollReveal>
        <h1 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
          {page.title}
        </h1>
      </ScrollReveal>
      <RichText value={page.body} fallback={[]} className="mt-10 text-lg leading-relaxed tracking-[-0.01em] text-ink" />
    </article>
  )
}

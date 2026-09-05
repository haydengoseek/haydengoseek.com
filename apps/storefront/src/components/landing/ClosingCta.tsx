import Link from "next/link"
import { ScrollReveal } from "@/lib/motion-variants"

export default function ClosingCta({
  heading = "HaydenGoSeek",
  body = "Hayden personally creates, scans, prints and frames his own work, giving you access to a truly end-to-end artistic process.",
  ctaLabel = "Buy Now",
  ctaHref = "/shop",
}: {
  heading?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <section className="border-t border-line bg-surface px-4 py-20 text-center sm:px-8 sm:py-28">
      <div className="mx-auto max-w-xl">
        <ScrollReveal effect="B" as="h2" className="text-3xl tracking-tight text-ink">
          {heading}
        </ScrollReveal>
        <ScrollReveal effect="A" as="p" className="mt-4 text-muted">
          {body}
        </ScrollReveal>
        <ScrollReveal effect="A" className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide uppercase hover:text-muted"
          >
            {ctaLabel} →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

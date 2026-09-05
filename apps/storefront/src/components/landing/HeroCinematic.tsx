"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useMotionTemplate, type MotionValue } from "motion/react"
import { useScrollValue } from "@/lib/motion-variants"

type Images = {
  backdrop: string
  insetReveal: string
  closing: string
}

/**
 * The contents of the closing frame: the still, a flat accent tint blended
 * over it, and the heading. Rendered once per split half.
 */
function ClosingFrame({
  image,
  accent,
  heading,
  headingOpacity,
  decorative = false,
}: {
  image: string
  accent: string
  heading: string
  headingOpacity: MotionValue<number>
  decorative?: boolean
}) {
  return (
    <>
      <Image src={image} alt={decorative ? "" : heading} fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 mix-blend-overlay" style={{ backgroundColor: accent }} />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.p
          style={{ opacity: headingOpacity }}
          className="max-w-[30ch] text-center text-[clamp(1.25rem,3.6vw,3rem)] leading-[1.2] tracking-[-0.01em] text-white"
        >
          {heading}
        </motion.p>
      </div>
    </>
  )
}

/**
 * Ported from Claude-Agency-Website-Build's module 87 (Hero — Cinematic
 * Curtain), restyled: the closing reveal panel uses this site's own bg/ink
 * tokens instead of the source's near-black-on-near-white, so it hands off
 * seamlessly into the rest of the page. Beat 2's headline is the logo
 * instead of text, and the source's two-reveal beat 4 (rectangle + diamond)
 * is trimmed to one (rectangle only) — the later beats' scroll ranges are
 * compacted to fill the freed-up scroll distance rather than leaving a dead
 * hold where the diamond used to be.
 */
export default function HeroCinematic({
  eyebrow = "Gold Coast, Australia",
  logoSrc = "/logo-white.svg",
  logoAlt = "HaydenGoSeek",
  accent = "#a8af93",
  zoomHeading = "Original artworks and museum-quality fine art prints by Hayden Andrews.",
  revealLabel = "About Hayden",
  revealStatement = "Original artworks, museum-quality fine art prints and handcrafted framing, all created under one roof by Hayden Andrews.",
  ctaLabel = "Shop Art",
  ctaHref = "/shop",
  images,
}: {
  eyebrow?: string
  logoSrc?: string
  logoAlt?: string
  accent?: string
  zoomHeading?: string
  revealLabel?: string
  revealStatement?: string
  ctaLabel?: string
  ctaHref?: string
  images: Images
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  // Beat 1–2 — backdrop settles, logo lifts away.
  const bgScale = useTransform(scrollYProgress, [0, 0.24], [1.12, 1])
  const bgY = useTransform(scrollYProgress, [0, 0.24], ["0%", "-6%"])
  const titleY = useTransform(scrollYProgress, [0, 0.22], [0, -70])
  const titleOpacity = useScrollValue(scrollYProgress, [0.12, 0.22], [1, 0])

  // Beat 3 — the curtain: draws out of the centre as a hairline, then wipes
  // outward to flood the frame.
  const curtainDraw = useTransform(scrollYProgress, [0.05, 0.19], [0, 1])
  const curtainWipe = useTransform(scrollYProgress, [0.28, 0.38], [0.006, 1])

  // Beat 4 — a rectangle clip opening from the centre.
  const insetPct = useTransform(scrollYProgress, [0.4, 0.52], [50, 0])
  const insetClip = useMotionTemplate`inset(${insetPct}% ${insetPct}%)`

  // Beat 5 — the closing still scales up from nothing, then holds.
  const finalScale = useTransform(scrollYProgress, [0.54, 0.64], [0, 1])
  const zoomHeadingOpacity = useScrollValue<number>(scrollYProgress, [0.58, 0.66], [0, 1])

  // Beat 6 — the split: the closing still is drawn twice, each clipped to one
  // half, and the halves slide apart to uncover the panel behind them.
  const splitLeft = useTransform(scrollYProgress, [0.7, 0.84], ["0vw", "-52vw"])
  const splitRight = useTransform(scrollYProgress, [0.7, 0.84], ["0vw", "52vw"])

  const panelOpacity = useScrollValue(scrollYProgress, [0.64, 0.67], [0, 1])
  const revealY = useTransform(scrollYProgress, [0.7, 0.86], [140, 0])
  const revealOpacity = useScrollValue(scrollYProgress, [0.72, 0.82], [0, 1])

  const chromeOpacity = useScrollValue(scrollYProgress, [0.2, 0.3], [1, 0])

  return (
    <section ref={ref} className="relative h-[390vh] bg-black [overflow-anchor:none]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Beat 1 — backdrop */}
        <motion.div style={{ scale: bgScale, y: bgY }} className="absolute inset-0">
          <Image src={images.backdrop} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/25" />
        </motion.div>

        {/* Beat 2 — logo */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="absolute inset-0 flex items-center justify-center px-7 md:px-6"
        >
          <img src={logoSrc} alt={logoAlt} className="w-[min(90vw,32rem)]" />
        </motion.div>

        {/* Beat 3 — the curtain */}
        <motion.div
          style={{ scaleX: curtainWipe, scaleY: curtainDraw, backgroundColor: accent }}
          className="absolute inset-0 origin-center"
        />

        {/* Beat 4 — clip reveal */}
        <motion.div style={{ clipPath: insetClip }} className="absolute inset-0">
          <Image src={images.insetReveal} alt="" fill sizes="100vw" className="object-cover" />
        </motion.div>

        {/* Beat 6 — the panel uncovered by the split */}
        <motion.div
          style={{ opacity: panelOpacity }}
          className="absolute inset-0 flex items-center justify-center bg-bg px-6 md:px-10"
        >
          <motion.div style={{ y: revealY, opacity: revealOpacity }} className="max-w-4xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{revealLabel}</p>
            <p className="mt-6 text-[clamp(1.375rem,3.4vw,2.75rem)] leading-[1.15] tracking-[-0.01em] text-ink">
              {revealStatement}
            </p>
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide uppercase hover:text-muted"
            >
              {ctaLabel} →
            </Link>
          </motion.div>
        </motion.div>

        {/* Beat 5–6 — closing still, drawn as two halves */}
        <motion.div
          style={{ scale: finalScale, x: splitLeft, clipPath: "inset(0 49.9% 0 0)" }}
          className="absolute inset-0 origin-center"
        >
          <ClosingFrame image={images.closing} accent={accent} heading={zoomHeading} headingOpacity={zoomHeadingOpacity} />
        </motion.div>
        <motion.div
          aria-hidden
          style={{ scale: finalScale, x: splitRight, clipPath: "inset(0 0 0 49.9%)" }}
          className="absolute inset-0 origin-center"
        >
          <ClosingFrame image={images.closing} accent={accent} heading={zoomHeading} headingOpacity={zoomHeadingOpacity} decorative />
        </motion.div>

        {/* Overlay chrome — edge marks, present only for the first beat */}
        <motion.div
          style={{ opacity: chromeOpacity }}
          className="pointer-events-none absolute inset-0 text-[0.6875rem] font-medium uppercase leading-none tracking-[0.02em] text-white"
        >
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-2 md:px-8">
            <span className="rotate-180 [writing-mode:vertical-rl] md:rotate-0 md:[writing-mode:horizontal-tb]">{eyebrow}</span>
            <span className="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">{ctaLabel} &#8599;</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
            <span>Scroll</span>
            <span>01 &mdash; Introduction</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

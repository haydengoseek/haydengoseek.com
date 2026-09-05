"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { useScrollValue } from "@/lib/motion-variants"
import { cn } from "@/lib/utils"

type Stat = { figure: string; note: string }
type Align = "left" | "center" | "right"
type Column = { align: Align; stats: Stat[] }

const DEFAULT_COLUMNS: Column[] = [
  {
    align: "left",
    stats: [
      { figure: "800+", note: "Songs written across a career in music" },
      { figure: "18+", note: "Years spent handcrafting frames in the Gold Coast studio" },
      { figure: "14", note: "One-of-one original artworks in the current collection" },
    ],
  },
  {
    align: "center",
    stats: [
      { figure: "7–10", note: "Days to produce most print orders" },
      { figure: "2–3", note: "Weeks for a fully custom framed piece" },
      { figure: "3", note: "Frame finishes — oak, black or white" },
    ],
  },
  {
    align: "right",
    stats: [
      { figure: "2", note: "Creative practices, art and music, one artist" },
      { figure: "2", note: "Academies where Hayden teaches songwriting" },
      { figure: "100%", note: "Of every piece made personally, start to finish" },
    ],
  },
]

const COLUMN_STEPS: number[][] = [
  [0, 0.24, 0.56],
  [0, 0.32, 0.64],
  [0, 0.4, 0.72],
]

const SCENE_STEPS = [0, 0.46, 0.78]

const DEFAULT_SCENES = [
  "Every piece made by one pair of hands, not a production line.",
  "From first brushstroke to the frame on your wall.",
  "Made the same way the music was — one take, no shortcuts.",
]

/** Opacity + offset for item `index` of a swapping set. See module 89's original notes on why travel and opacity share one ramp. */
function useSwap(progress: MotionValue<number>, steps: number[], index: number, fade = 0.035, travel = 115) {
  const isFirst = index === 0
  const isLast = index === steps.length - 1
  const start = steps[index]
  const next = isLast ? 1 : steps[index + 1]

  const input = isFirst ? [next - fade, next] : isLast ? [start - fade, start] : [start - fade, start, next - fade, next]
  const fades = isFirst ? [1, 0] : isLast ? [0, 1] : [0, 1, 1, 0]
  const travels = isFirst ? [0, -travel] : isLast ? [travel, 0] : [travel, 0, 0, -travel]

  return {
    opacity: useScrollValue(progress, input, fades),
    y: useTransform(progress, input, travels),
  }
}

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "sm:text-center",
  right: "sm:text-right",
}

function StatEntry({ stat, progress, steps, index, align }: { stat: Stat; progress: MotionValue<number>; steps: number[]; index: number; align: Align }) {
  const { opacity, y } = useSwap(progress, steps, index)
  return (
    <motion.div style={{ opacity, y }} className={cn("absolute inset-x-0 top-0", ALIGN_CLASS[align])}>
      <p className="text-[clamp(3rem,7.4vw,9rem)] tracking-[-0.03em] text-white">{stat.figure}</p>
      <p
        className={cn(
          "mt-5 max-w-[32ch] text-[clamp(0.75rem,0.9vw,1rem)] font-medium uppercase leading-[1.3] tracking-[0.01em] text-white/90",
          align === "center" && "sm:mx-auto",
          align === "right" && "sm:ml-auto"
        )}
      >
        {stat.note}
      </p>
    </motion.div>
  )
}

function Scene({ text, progress, index }: { text: string; progress: MotionValue<number>; index: number }) {
  const { opacity, y } = useSwap(progress, SCENE_STEPS, index, 0.08, 20)
  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-x-0 top-0 mx-auto max-w-[68ch] text-center text-[clamp(0.8125rem,1.05vw,1.125rem)] font-medium uppercase leading-[1.35] tracking-[0.01em] text-white"
    >
      {text}
    </motion.p>
  )
}

function Backdrop({ image, progress, index }: { image: string; progress: MotionValue<number>; index: number }) {
  const { opacity } = useSwap(progress, SCENE_STEPS, index, 0.08)
  const scale = useTransform(progress, [0, 1], [1.12, 1])
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
    </motion.div>
  )
}

/**
 * Ported from Claude-Agency-Website-Build's module 89 (Stats — Column
 * Scroller). Kept dark/full-bleed like the hero — a deliberate photo-driven
 * punctuation moment rather than forced into the site's light palette,
 * since the effect depends on white text over a rotating backdrop. Backdrops
 * and figures are real Hayden facts/artwork instead of placeholders.
 */
export default function StatsScroller({
  eyebrow = "By the numbers",
  columns = DEFAULT_COLUMNS,
  scenes = DEFAULT_SCENES,
  backdrops,
}: {
  eyebrow?: string
  columns?: Column[]
  scenes?: string[]
  backdrops: string[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  if (backdrops.length === 0) return null

  return (
    <section ref={ref} className="relative h-[380vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        {backdrops.map((image, i) => (
          <Backdrop key={image} image={image} progress={scrollYProgress} index={i} />
        ))}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative flex h-full flex-col px-5 pt-20 pb-6 md:px-8 md:pt-24 md:pb-8">
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
            {columns.map((column, c) => (
              <div key={column.align} className="relative min-h-[clamp(9rem,14vw,15rem)]">
                {column.stats.map((stat, i) => (
                  <StatEntry key={stat.figure + i} stat={stat} progress={scrollYProgress} steps={COLUMN_STEPS[c]} index={i} align={column.align} />
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-1 items-center">
            <div className="relative w-full">
              {scenes.map((text, i) => (
                <Scene key={text} text={text} progress={scrollYProgress} index={i} />
              ))}
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.02em] text-white/70">{eyebrow}</p>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"

type Member = { name: string[]; role: string; bio: string; image: string }

const DEFAULT_TEAM: Member[] = [
  {
    name: ["Hayden", "Andrews"],
    role: "Artist & Musician",
    image: "",
    bio: "A Gold Coast-based artist, musician, songwriter and educator whose work is inspired by connection, storytelling and the beauty found in everyday life. He personally creates, scans, prints and frames every piece himself.",
  },
]

const slide = {
  enter: (dir: number) => ({ y: dir > 0 ? "100%" : "-100%" }),
  center: { y: "0%" },
  exit: (dir: number) => ({ y: dir > 0 ? "-100%" : "100%" }),
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Ported from Claude-Agency-Website-Build's module 94 (Team — Split
 * Slider), restyled into this site's light palette (the reference's dark
 * treatment was a stylistic choice, not load-bearing for the effect — this
 * is a bio panel, not a photo-driven moment like the hero/stats). Prev/next
 * only render when there's more than one member, since Hayden works solo.
 */
export default function TeamSlider({ eyebrow = "The artist", members = DEFAULT_TEAM }: { eyebrow?: string; members?: Member[] }) {
  const [[index, direction], setState] = useState<[number, number]>([0, 1])

  const paginate = (step: number) => setState(([i]) => [(i + step + members.length) % members.length, step])

  const member = members[index]

  return (
    <section id="about" className="relative scroll-mt-24 border-t border-line bg-bg">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Portrait half */}
        <div className="relative min-h-[52vh] overflow-hidden bg-surface lg:min-h-screen">
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0"
            >
              {member.image && (
                <Image src={member.image} alt={member.name.join(" ")} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Copy half */}
        <div className="relative flex flex-col justify-between overflow-hidden p-6 md:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{eyebrow}</p>

          <div className="py-12">
            <AnimatePresence custom={direction} initial={false} mode="popLayout">
              <motion.div key={index} custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.9, ease: EASE }}>
                <h3 className="font-serif text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.02em] text-ink">
                  {member.name.map((part) => (
                    <span key={part} className="block">
                      {part}
                    </span>
                  ))}
                </h3>
                <p className="mt-6 text-xs font-medium uppercase tracking-[0.08em] text-muted">{member.role}</p>
                <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted">{member.bio}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {members.length > 1 && (
            <div className="flex items-center justify-between border-t border-line pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                {String(index + 1).padStart(2, "0")} / {String(members.length).padStart(2, "0")}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label="Previous"
                  className="rounded-full border border-line px-5 py-2.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] transition-colors hover:border-ink hover:bg-ink hover:text-bg"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label="Next"
                  className="rounded-full border border-line px-5 py-2.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] transition-colors hover:border-ink hover:bg-ink hover:text-bg"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"
import { ScrollReveal, StaggerGroup } from "@/lib/motion-variants"
import RichText from "@/components/RichText"
import type { SanityFaqItem } from "@/lib/sanity"

// Real content scraped from the live WordPress FAQ section (2026-09-05) —
// used until real faqItem documents exist in Sanity.
const DEFAULT_FAQS: SanityFaqItem[] = [
  { question: "Are your artworks original?", answer: [] },
  { question: "Do you offer fine art prints?", answer: [] },
  { question: "Do you offer canvas prints?", answer: [] },
  { question: "Are your prints limited edition?", answer: [] },
  { question: "Can I choose my size?", answer: [] },
  { question: "Can I have my artwork framed?", answer: [] },
  { question: "What kind of glass do you use?", answer: [] },
  { question: "How long will my order take?", answer: [] },
  { question: "Do you ship internationally?", answer: [] },
  { question: "How is my artwork packaged?", answer: [] },
  { question: "Can I commission a custom artwork?", answer: [] },
  { question: "What if my artwork arrives damaged?", answer: [] },
  { question: "Can I return my order?", answer: [] },
  { question: "Who creates the framing?", answer: [] },
  { question: "Will the colours look exactly the same as on my screen?", answer: [] },
  { question: "How do I care for my artwork?", answer: [] },
  { question: "Do you sign your prints?", answer: [] },
]

const DEFAULT_ANSWERS: Record<string, string> = {
  "Are your artworks original?":
    "Yes. My original artworks are one-of-a-kind, hand-created pieces. Once an original has sold, it will be marked as sold and won't be available again.",
  "Do you offer fine art prints?":
    "Yes. Every print is produced using museum-quality archival inks on premium materials to ensure exceptional colour, detail and longevity.",
  "Do you offer canvas prints?":
    "Yes. My canvas prints are produced using archival inks on premium artist canvas before being professionally hand-stretched over timber stretcher bars.",
  "Are your prints limited edition?":
    "Some collections are released as limited editions while others remain open editions. If a print is limited edition it will be clearly noted on the product page.",
  "Can I choose my size?":
    "Absolutely. We have sizes carefully selected to suit the proportions of the original artwork, but if you want a custom size we can accommodate that request.",
  "Can I have my artwork framed?":
    "Yes. You can order your artwork unframed or choose from professionally handcrafted frames in oak, black or white. Every frame is custom made in my Gold Coast studio.",
  "What kind of glass do you use?":
    "Our framed paper prints are available with premium acrylic (or standard glazing, local only) depending on the size and product selected. Artglass or anti-reflective acrylic are available on request at an extra cost (minimal reflection).",
  "How long will my order take?":
    "Most print orders are produced within 7–10 business days. Framed orders generally take 2–3 weeks as each frame is custom made by hand.",
  "Do you ship internationally?":
    "Yes. We ship throughout Australia and to many countries worldwide. Shipping costs are calculated at checkout.",
  "How is my artwork packaged?":
    "Every artwork is carefully packaged to ensure it arrives safely. Prints are shipped flat or rolled depending on size, while framed works are professionally protected using heavy-duty packaging.",
  "Can I commission a custom artwork?":
    "Yes. I occasionally accept commission work. If you're interested in a custom piece, please get in touch through the Contact page to discuss your ideas.",
  "What if my artwork arrives damaged?":
    "Although every order is packaged with great care, if your artwork arrives damaged please contact me within 48 hours and include photographs of both the artwork and packaging so I can arrange a replacement or solution.",
  "Can I return my order?":
    "Because each print and frame is made to order, change-of-mind returns aren't accepted. However, if your order arrives damaged or there's a manufacturing issue, I'll make it right.",
  "Who creates the framing?":
    "Every frame is handcrafted in my own professional framing workshop on the Gold Coast. I've spent over 18 years framing artwork, so every piece is made with the same level of care I'd use for my own collection.",
  "Will the colours look exactly the same as on my screen?":
    "Every effort is made to accurately represent the artwork, however colours can vary slightly between different computer monitors, phones and tablets.",
  "How do I care for my artwork?":
    "Keep your artwork out of direct sunlight and avoid areas with excessive humidity. Dust frames gently with a soft cloth and avoid using cleaning products directly on the artwork.",
  "Do you sign your prints?":
    "Yes. Where applicable, prints are individually signed, and limited editions are also numbered.",
}

export default function Faq({
  heading = "Frequently asked questions",
  items = DEFAULT_FAQS,
}: {
  heading?: string
  items?: SanityFaqItem[]
}) {
  const [open, setOpen] = useState<number | null>(0)
  if (items.length === 0) return null

  return (
    <section id="faq" className="border-t border-line px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal effect="A" as="h2" className="text-3xl tracking-tight text-ink">
          {heading}
        </ScrollReveal>

        <StaggerGroup className="mt-10 divide-y divide-line border-t border-line">
          {items.map((item, i) => (
            <ScrollReveal effect="A" key={item.question}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-sm">{item.question}</span>
                <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <RichText
                      value={item.answer}
                      fallback={[DEFAULT_ANSWERS[item.question] ?? ""]}
                      className="pb-5 text-sm text-muted"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollReveal>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}

"use client"

import { ScrollReveal, StaggerGroup } from "@/lib/motion-variants"

const FIELDS = [
  { name: "name", label: "Name", placeholder: "Type your name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", placeholder: "Type your email", type: "email", autoComplete: "email" },
] as const

/**
 * Ported from Claude-Agency-Website-Build's module 95 (Contact — Statement
 * Form), restyled into this site's light palette. Presentational only, same
 * as the source — no submit handler wired yet (see RESEND_API_KEY stub in
 * .env.example), so the host page owns action/method/onSubmit once that's
 * built.
 */
export default function ContactSection({
  id = "contact",
  eyebrow = "Say g'day",
  lines = ["Say g'day,", "let's chat"],
  note = "Hayden will get back to you personally, within 24 hours.",
  directEmail = "info@haydengoseek.com",
  studioAddress = "10 Ferry Road, Southport QLD",
}: {
  id?: string
  eyebrow?: string
  lines?: string[]
  note?: string
  directEmail?: string
  studioAddress?: string
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line bg-bg py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
        <ScrollReveal>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{eyebrow}</p>
        </ScrollReveal>

        <h2 className="mt-8">
          {lines.map((line) => (
            <ScrollReveal as="span" key={line} className="block overflow-hidden pb-2">
              <span className="block text-[clamp(1.75rem,4.4vw,3.75rem)] leading-[1.15] tracking-[-0.02em] text-ink">{line}</span>
            </ScrollReveal>
          ))}
        </h2>

        <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,44%)] lg:gap-20">
          <form className="space-y-10">
            <StaggerGroup className="space-y-10">
              {FIELDS.map((field) => (
                <div key={field.name}>
                  <label htmlFor={`contact-${field.name}`} className="block text-xs font-medium uppercase tracking-[0.08em] text-muted">
                    {field.label}
                  </label>
                  <input
                    id={`contact-${field.name}`}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    className="mt-4 w-full border-b border-line bg-transparent pb-3 text-lg tracking-[-0.01em] text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-ink focus-visible:ring-0"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={3}
                  placeholder="What are you looking for?"
                  className="mt-4 w-full resize-none border-b border-line bg-transparent pb-3 text-lg tracking-[-0.01em] text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-ink"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-9 py-4 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-bg transition-transform duration-300 hover:scale-[1.03]"
              >
                Send &#8599;
              </button>
            </StaggerGroup>
          </form>

          <ScrollReveal className="lg:pt-2">
            <p className="max-w-[38ch] text-sm leading-relaxed text-muted">{note}</p>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Direct</dt>
                <dd className="mt-2 text-lg tracking-[-0.01em] text-ink">{directEmail}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Studio</dt>
                <dd className="mt-2 max-w-[30ch] text-lg leading-snug tracking-[-0.01em] text-ink">{studioAddress}</dd>
              </div>
            </dl>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

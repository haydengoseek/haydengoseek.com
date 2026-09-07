import Link from "next/link"
import { getSiteSettings } from "@/lib/sanity"

// Real current-site copy, kept as the default whenever a Sanity field is left blank.
const FALLBACK_NEWSLETTER_HEADING = "Keep in touch"
const FALLBACK_NEWSLETTER_BODY = "Sign up to hear about new artworks and limited editions."
const FALLBACK_NEWSLETTER_PLACEHOLDER = "Enter your email"
const FALLBACK_COPYRIGHT_NAME = "HaydenGoSeek"
const FALLBACK_FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All artworks", href: "/shop" },
      { label: "Originals", href: "/shop?type=original" },
      { label: "Prints", href: "/shop?type=print" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Hayden", href: "/about" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
]

export default async function Footer() {
  const settings = await getSiteSettings()

  const newsletterHeading = settings?.newsletterHeading || FALLBACK_NEWSLETTER_HEADING
  const newsletterBody = settings?.newsletterBody || FALLBACK_NEWSLETTER_BODY
  const newsletterPlaceholder = settings?.newsletterPlaceholder || FALLBACK_NEWSLETTER_PLACEHOLDER
  const copyrightName = settings?.copyrightName || FALLBACK_COPYRIGHT_NAME
  const columns = settings?.footerColumns?.length ? settings.footerColumns : FALLBACK_FOOTER_COLUMNS

  return (
    <footer className="mt-24 border-t border-line bg-bg">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-16 sm:px-8 md:grid-cols-5">
        <div className="col-span-2">
          <p className="text-sm font-medium">{newsletterHeading}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{newsletterBody}</p>
          <form className="mt-4 flex max-w-xs border-b border-ink">
            <input
              type="email"
              placeholder={newsletterPlaceholder}
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
            />
            <button type="submit" className="text-sm text-muted hover:text-ink">
              →
            </button>
          </form>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-sm font-medium">{col.heading}</p>
            <ul className="mt-2 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-4 py-4 text-xs text-muted sm:px-8">
          © {new Date().getFullYear()} {copyrightName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

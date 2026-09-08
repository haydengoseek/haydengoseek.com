import Link from "next/link"
import { getCartItemCount } from "@/lib/cart-actions"
import { getSiteSettings } from "@/lib/sanity"

// Real current-site copy, kept as the default whenever a Sanity field is left blank.
const FALLBACK_SITE_NAME = "HaydenGoSeek"
const FALLBACK_ANNOUNCEMENT = "Original artworks, fine art prints & handcrafted framing — Gold Coast, Australia"
const FALLBACK_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
]

export default async function Header() {
  const [itemCount, settings] = await Promise.all([getCartItemCount(), getSiteSettings()])

  const siteName = settings?.title || FALLBACK_SITE_NAME
  const announcement = settings?.announcementText || FALLBACK_ANNOUNCEMENT
  const navLinks = settings?.navLinks?.length ? settings.navLinks : FALLBACK_NAV_LINKS

  return (
    <header className="sticky top-0 z-40 bg-bg">
      <div className="border-b border-line">
        <p className="mx-auto max-w-[1600px] px-4 py-2 text-center text-xs tracking-wide text-muted sm:px-8">
          {announcement}
        </p>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteName}
        </Link>

        <nav className="order-3 flex w-full gap-6 text-sm sm:order-none sm:w-auto sm:gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-muted">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/cart" aria-label={`${itemCount} items in cart`} className="hover:text-muted">
            Cart ({itemCount})
          </Link>
        </div>
      </div>
    </header>
  )
}

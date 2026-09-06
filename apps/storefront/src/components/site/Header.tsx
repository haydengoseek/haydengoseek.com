import Link from "next/link"
import { getCartItemCount } from "@/lib/cart-actions"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/#about" },
  { label: "FAQs", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
]

export default async function Header() {
  const itemCount = await getCartItemCount()

  return (
    <header className="sticky top-0 z-40 bg-bg">
      <div className="border-b border-line">
        <p className="mx-auto max-w-[1600px] px-4 py-2 text-center text-xs tracking-wide text-muted sm:px-8">
          Original artworks, fine art prints &amp; handcrafted framing — Gold Coast, Australia
        </p>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          HaydenGoSeek
        </Link>

        <nav className="order-3 flex w-full gap-6 text-sm sm:order-none sm:w-auto sm:gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-muted">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <span aria-label={`${itemCount} items in cart`}>Cart ({itemCount})</span>
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All artworks", href: "/shop" },
      { label: "Originals", href: "/shop?type=original" },
      { label: "Prints", href: "/shop?type=print" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Hayden", href: "/about" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bg">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-16 sm:px-8 md:grid-cols-5">
        <div className="col-span-2">
          <p className="text-sm font-medium">Keep in touch</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Sign up to hear about new artworks and limited editions.
          </p>
          <form className="mt-4 flex max-w-xs border-b border-ink">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
            />
            <button type="submit" className="text-sm text-muted hover:text-ink">
              →
            </button>
          </form>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-medium">{col.title}</p>
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
          © {new Date().getFullYear()} HaydenGoSeek. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

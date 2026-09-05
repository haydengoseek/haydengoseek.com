import type { ReactNode } from "react"
import { LenisProvider } from "@/lib/lenis-provider"

// Scopes smooth-scroll + entrance animations to the landing page and future
// content pages (About, Contact, etc.) without touching /shop or
// /products/[handle], which stay on plain native scroll. Mounting/unmounting
// happens naturally on route change since this layout only wraps this group.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <LenisProvider>{children}</LenisProvider>
}

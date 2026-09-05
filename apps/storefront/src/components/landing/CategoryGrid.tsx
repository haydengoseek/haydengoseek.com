import Link from "next/link"
import { ScrollReveal, StaggerGroup } from "@/lib/motion-variants"

type Category = { title: string; description: string; href: string }

const DEFAULT_CATEGORIES: Category[] = [
  { title: "Original Artworks", description: "Framed original works on canvas", href: "/shop" },
  { title: "Framed Prints", description: "Selected originals available to print & frame", href: "/shop" },
  { title: "Limited Editions", description: "Limited edition prints", href: "/shop" },
]

export default function CategoryGrid({ categories = DEFAULT_CATEGORIES }: { categories?: Category[] }) {
  return (
    <StaggerGroup className="grid grid-cols-1 border-t border-line sm:grid-cols-3">
      {categories.map((category, i) => (
        <ScrollReveal effect="A" key={category.title}>
          <Link
            href={category.href}
            className={`block border-b border-line p-8 transition-colors hover:bg-surface sm:border-b-0 ${
              i > 0 ? "sm:border-l sm:border-line" : ""
            }`}
          >
            <p className="text-sm">{category.title}</p>
            <p className="mt-1 text-sm text-muted">{category.description}</p>
          </Link>
        </ScrollReveal>
      ))}
    </StaggerGroup>
  )
}

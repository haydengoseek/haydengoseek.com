import { PortableText, type PortableTextComponents } from "@portabletext/react"
import type { PortableTextBlock } from "@portabletext/types"

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
  },
}

/**
 * Renders Sanity Portable Text when present, otherwise plain fallback
 * paragraphs — so every content section works with real hardcoded copy
 * before a Sanity project exists, and switches to CMS content once one does.
 */
export default function RichText({
  value,
  fallback,
  className,
}: {
  value: PortableTextBlock[] | null | undefined
  fallback: string[]
  className?: string
}) {
  if (value && value.length > 0) {
    return (
      <div className={className}>
        <PortableText value={value} components={components} />
      </div>
    )
  }
  return (
    <div className={className}>
      {fallback.map((paragraph, i) => (
        <p key={i} className="mt-4 first:mt-0">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

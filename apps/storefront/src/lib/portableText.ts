import type { PortableTextBlock } from "@portabletext/types"

/** Flattens Portable Text blocks to plain text, for contexts (slide captions, meta tags) that can't render rich text. */
export function portableTextToPlainText(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks) return ""
  return blocks
    .map((block) =>
      "children" in block && Array.isArray(block.children)
        ? block.children.map((child) => ("text" in child ? child.text : "")).join("")
        : ""
    )
    .join(" ")
    .trim()
}

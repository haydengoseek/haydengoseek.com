// Fetches exact per-variation prices from the live WooCommerce product pages.
// The public Store API only exposes a price *range* per product, but each
// classic product page embeds a `data-product_variations` attribute with the
// real display_price per Type/Size/Frame combination (WooCommerce's variation
// form data, server-rendered into the page — no auth needed).
import { readFile, writeFile } from "node:fs/promises"

const catalog = JSON.parse(
  await readFile(new URL("./catalog.json", import.meta.url), "utf8")
)

function extractVariations(html) {
  const match = html.match(/data-product_variations="([^"]*)"/)
  if (!match) return null
  const decoded = match[1]
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
  return JSON.parse(decoded)
}

const results = []
for (const product of catalog.products) {
  const url = `https://haydengoseek.com/product/${product.slug}/`
  console.log(`Fetching ${product.slug}...`)
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  ${res.status} on ${url} — skipping`)
    continue
  }
  const html = await res.text()
  const variations = extractVariations(html)
  if (!variations) {
    console.warn(`  No variation data found for ${product.slug}`)
    continue
  }
  results.push({
    id: product.id,
    slug: product.slug,
    variations: variations.map((v) => ({
      type: v.attributes.attribute_type,
      size: v.attributes.attribute_size,
      frame: v.attributes.attribute_frame,
      price: v.display_price,
    })),
  })
}

await writeFile(
  new URL("./variation-prices.json", import.meta.url),
  JSON.stringify({ fetchedAt: new Date().toISOString(), products: results }, null, 2)
)
console.log(`\nDone. ${results.length}/${catalog.products.length} products fetched.`)

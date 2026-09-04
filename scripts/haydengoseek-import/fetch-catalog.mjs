// One-off data pipeline: pull the full product catalog from the live WordPress/
// WooCommerce site (haydengoseek.com, WooCommerce Store API — public, read-only)
// into a local JSON file to seed the new Medusa catalog from.
//
// IMPORTANT LIMITATION: the public Store API only returns a price *range* per
// product (min/max across all variations), not the exact price of each individual
// variation, and it doesn't expose stock levels. Real per-variation prices/stock
// must come from Hayden's WooCommerce Products -> Export CSV (see README). This
// script captures everything else (attributes, variation attribute combinations,
// descriptions, images, categories) so that CSV only needs to be joined in on
// price/stock/SKU per variation, not re-typed from scratch.
import { writeFile } from "node:fs/promises"

const BASE = "https://haydengoseek.com/wp-json/wc/store/v1"
const CONCURRENCY = 3

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getJSON(url, attempt = 1) {
  const res = await fetch(url)
  if (!res.ok) {
    if (attempt <= 5) {
      const wait = attempt * 1000
      console.warn(`  ${res.status} on ${url} — retrying in ${wait}ms (attempt ${attempt})`)
      await sleep(wait)
      return getJSON(url, attempt + 1)
    }
    throw new Error(`${res.status} ${url}`)
  }
  return res.json()
}

async function getAllPages(path) {
  const first = await fetch(`${BASE}${path}${path.includes("?") ? "&" : "?"}per_page=100&page=1`)
  const totalPages = Number(first.headers.get("X-WP-TotalPages") || 1)
  const firstBody = await first.json()
  if (totalPages <= 1) return firstBody
  const rest = await mapLimit(
    Array.from({ length: totalPages - 1 }, (_, i) => i + 2),
    CONCURRENCY,
    (page) => getJSON(`${BASE}${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`)
  )
  return [firstBody, ...rest].flat()
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

const ENTITIES = {
  "&#8211;": "–",
  "&#8217;": "'",
  "&amp;": "&",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8230;": "…",
  "&#8216;": "'",
  "&nbsp;": " ",
}

function decodeEntities(str) {
  return (str || "").replace(/&#?\w+;/g, (m) => ENTITIES[m] ?? m)
}

function stripHtml(html) {
  return decodeEntities(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/‍/g, "")
    .trim()
}

console.log("Fetching categories...")
const rawCategories = await getAllPages("/products/categories")
const categories = rawCategories.map((c) => ({
  id: c.id,
  name: decodeEntities(c.name),
  slug: c.slug,
  parent: c.parent || null,
  count: c.count,
}))

console.log("Fetching product list (all pages)...")
const productList = await getAllPages("/products")
console.log(`Found ${productList.length} products`)

console.log("Fetching full product detail (attributes, variations, images)...")
const products = await mapLimit(productList, CONCURRENCY, async (p) => {
  const full = await getJSON(`${BASE}/products/${p.id}`)
  return {
    id: full.id,
    name: decodeEntities(full.name),
    slug: full.slug,
    sku: full.sku,
    descriptionHtml: full.description || "",
    shortDescription: stripHtml(full.short_description),
    categories: (full.categories || []).map((c) => c.id),
    priceRange: full.prices?.price_range || null,
    currency: full.prices?.currency_code || null,
    // Attribute definitions (Type / Size / Frame) with their possible values —
    // used to build Medusa product options.
    attributes: (full.attributes || []).map((a) => ({
      name: a.name,
      terms: (a.terms || []).map((t) => t.name),
    })),
    // Every Type x Size x Frame combination that exists as a purchasable
    // variation. No price/stock here (see file header) — join against the
    // WooCommerce CSV export on `sku` pattern or attribute combo to fill that in.
    variations: (full.variations || []).map((v) => ({
      id: v.id,
      attributes: (v.attributes || []).reduce((acc, a) => {
        acc[a.name] = a.value
        return acc
      }, {}),
    })),
    // Tagged by which attribute value they visually represent, where guessable
    // from the filename (e.g. "leaves-oak.jpg" -> Frame=Oak). Manually verify/
    // correct these tags before import — filename heuristics are not reliable
    // for every product.
    images: (full.images || []).map((img) => ({
      src: img.src,
      alt: decodeEntities(img.alt || "") || full.name,
      name: img.name,
    })),
  }
})

const out = { fetchedAt: new Date().toISOString(), source: "https://haydengoseek.com", categories, products }
await writeFile(new URL("./catalog.json", import.meta.url), JSON.stringify(out, null, 2))

console.log(`Done. ${categories.length} categories, ${products.length} products -> catalog.json`)

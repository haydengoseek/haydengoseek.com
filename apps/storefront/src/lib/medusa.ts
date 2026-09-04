import Medusa from "@medusajs/js-sdk"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
})

// Type/Size/Frame option values, resolved from a Medusa variant's options array.
export type VariantOptionValues = Record<string, string>

export function getVariantOptionValues(
  variant: { options?: { option?: { title?: string } | null; value: string }[] | null }
): VariantOptionValues {
  const values: VariantOptionValues = {}
  for (const opt of variant.options ?? []) {
    const title = opt.option?.title
    if (title) values[title] = opt.value
  }
  return values
}

// Picks the product image that best matches the currently selected options.
// Images are tagged in Medusa with metadata like { frame: "Oak", type: "Paper Print" }
// (see the seed script's tagImageFile for how tags are derived from Hayden's
// filenames). Not every Type×Frame combination has its own photo, so this
// scores each image by how well it agrees with the current selection rather
// than requiring an exact match: a defined tag that matches adds to the
// score, one that contradicts subtracts (weighted more heavily for Type than
// Frame, since showing the wrong product type — e.g. a canvas photo for a
// paper print — is a bigger misrepresentation than the wrong frame colour).
// An untagged (lifestyle/mockup) image never contradicts anything and scores
// 0, so it only wins when nothing tagged is a good fit.
export function getImageForOptions(
  images: { url: string; metadata?: Record<string, unknown> | null }[] | null | undefined,
  selectedOptions: VariantOptionValues
): string | undefined {
  if (!images?.length) return undefined

  // The Original is a one-of-one piece, always photographed unframed (tagged
  // frame: "No frame", no type — that same photo doubles as the "Canvas
  // Print + No frame" shot, per Hayden's convention). Every seeded Original
  // variant's Frame is technically "Oak" (a data necessity — WooCommerce
  // variations require some frame value even though there's no real framing
  // choice for a bespoke original), so scoring by Frame would wrongly prefer
  // the Oak-framed Canvas Print photo. Original always shows its own photo
  // instead, regardless of the nominally-selected Frame.
  if (selectedOptions["Type"] === "Original") {
    const original = images.find((img) => {
      const meta = img.metadata
      return !meta?.type && meta?.frame === "No frame"
    })
    if (original) return original.url
  }

  let best = images[0]
  let bestScore = -Infinity
  for (const img of images) {
    const frame = img.metadata?.frame as string | undefined
    const type = img.metadata?.type as string | undefined
    let score = 0
    if (type) score += type === selectedOptions["Type"] ? 2 : -2
    if (frame) score += frame === selectedOptions["Frame"] ? 1 : -1
    if (score > bestScore) {
      bestScore = score
      best = img
    }
  }
  return best.url
}

// An Original variant with 0 stock should disappear from the Type selector
// entirely, while Canvas/Paper Print variants (manage_inventory: false) stay
// selectable regardless of stock. See plan doc "Sold originals" decision.
export function isVariantPurchasable(variant: { manageInventory: boolean; stockedQuantity: number }): boolean {
  if (!variant.manageInventory) return true
  return variant.stockedQuantity > 0
}

// ---- Raw store API response shapes ----
// Narrow types for exactly the fields each query below requests via `fields:`
// — the SDK's generated HttpTypes don't model dynamic field selection, so we
// type the parts we actually read instead of reaching for `any`.

type RawOptionValue = { value: string }
type RawOption = { id: string; title: string; values: RawOptionValue[] }
type RawCategoryRef = { id: string; name: string; handle: string }
type RawCalculatedPrice = { calculated_amount: number } | null
type RawVariantOption = { value: string; option?: { title?: string } | null }
type RawLocationLevel = { stocked_quantity: number }
type RawInventoryItem = { inventory?: { location_levels?: RawLocationLevel[] } | null }
type RawImage = { id: string; url: string; metadata: Record<string, unknown> | null }

type RawListVariant = { calculated_price?: RawCalculatedPrice }
type RawListProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variants?: RawListVariant[]
}

type RawDetailVariant = {
  id: string
  title: string
  sku: string | null
  manage_inventory: boolean
  options?: RawVariantOption[]
  calculated_price?: RawCalculatedPrice
  inventory_items?: RawInventoryItem[]
}
type RawDetailProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  categories?: RawCategoryRef[]
  images?: RawImage[]
  options?: RawOption[]
  variants?: RawDetailVariant[]
}

// ---- Region ----

export type Region = { id: string; currencyCode: string }

let regionCache: Region | null = null

export async function getRegion(): Promise<Region> {
  if (regionCache) return regionCache
  const { regions } = await medusa.store.region.list({ limit: 1 })
  const region = regions[0]
  if (!region) throw new Error("No Medusa region configured — run the seed script.")
  regionCache = { id: region.id, currencyCode: region.currency_code }
  return regionCache
}

// ---- Categories ----

export type Category = { id: string; name: string; handle: string }

export async function listCategories(): Promise<Category[]> {
  const { product_categories } = await medusa.store.category.list({
    fields: "id,name,handle,products.id",
    limit: 100,
  })
  return (product_categories as unknown as (RawCategoryRef & { products?: unknown[] })[])
    .filter((c) => (c.products?.length ?? 0) > 0)
    .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))
}

// ---- Product listing ----

export type ProductListItem = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  priceRange: { min: number; max: number }
  variantCount: number
}

const LIST_FIELDS = "id,title,handle,thumbnail,*variants.calculated_price,*categories"

function toListItem(p: RawListProduct): ProductListItem {
  const amounts = (p.variants ?? []).map((v) => v.calculated_price?.calculated_amount ?? 0)
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    priceRange: { min: Math.min(...amounts), max: Math.max(...amounts) },
    variantCount: p.variants?.length ?? 0,
  }
}

// Pass a category *handle* (not id) — resolved against listCategories() first,
// since the store API's product filter takes category ids.
export async function listProducts(opts?: { categoryHandle?: string }): Promise<ProductListItem[]> {
  const region = await getRegion()

  let categoryId: string | undefined
  if (opts?.categoryHandle) {
    const categories = await listCategories()
    categoryId = categories.find((c) => c.handle === opts.categoryHandle)?.id
    if (!categoryId) return []
  }

  const { products } = await medusa.store.product.list({
    region_id: region.id,
    fields: LIST_FIELDS,
    limit: 100,
    ...(categoryId ? { category_id: [categoryId] } : {}),
  })

  return (products as unknown as RawListProduct[]).map(toListItem)
}

// ---- Product detail ----

export type ProductImage = { id: string; url: string; metadata: { frame?: string; type?: string } | null }
export type ProductOption = { id: string; title: string; values: string[] }
export type ProductVariant = {
  id: string
  title: string
  sku: string | null
  manageInventory: boolean
  stockedQuantity: number
  options: VariantOptionValues
  price: number
}

export type ProductDetail = {
  id: string
  title: string
  handle: string
  description: string | null
  categories: Category[]
  images: ProductImage[]
  options: ProductOption[]
  variants: ProductVariant[]
  currencyCode: string
}

const DETAIL_FIELDS =
  "id,title,handle,description,*images,*options,*options.values,*categories," +
  "*variants,*variants.options,*variants.calculated_price," +
  "*variants.inventory_items.inventory.location_levels"

function stockedQuantity(variant: RawDetailVariant): number {
  return (variant.inventory_items ?? []).reduce(
    (sum, ii) => sum + (ii.inventory?.location_levels ?? []).reduce((s, l) => s + (l.stocked_quantity ?? 0), 0),
    0
  )
}

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const region = await getRegion()
  const { products } = await medusa.store.product.list({
    handle,
    region_id: region.id,
    fields: DETAIL_FIELDS,
  })
  const p = (products as unknown as RawDetailProduct[])[0]
  if (!p) return null

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    categories: (p.categories ?? []).map((c) => ({ id: c.id, name: c.name, handle: c.handle })),
    images: (p.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      metadata: img.metadata as { frame?: string; type?: string } | null,
    })),
    options: (p.options ?? []).map((o) => ({
      id: o.id,
      title: o.title,
      values: o.values.map((v) => v.value),
    })),
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      manageInventory: v.manage_inventory,
      stockedQuantity: stockedQuantity(v),
      options: getVariantOptionValues(v),
      price: v.calculated_price?.calculated_amount ?? 0,
    })),
    currencyCode: region.currencyCode,
  }
}

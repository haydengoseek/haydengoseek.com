/**
 * Seeds the Medusa catalog from scripts/haydengoseek-import/catalog.json (run
 * `node scripts/haydengoseek-import/fetch-catalog.mjs` from the repo root first
 * to (re)generate it from the live WordPress site) for product/variant/price
 * data, and from Artwork-images/<Folder>/ (Hayden's real photography, resupplied
 * 2026-09-05) for images — uploaded to Medusa's file storage and tagged per
 * artwork/frame/type here (see tagImageFile below), not pulled from catalog.json.
 *
 * PRICING IS A PLACEHOLDER. The public WooCommerce API only exposes a price
 * *range* per product (min/max across all variations), not the exact price of
 * each Type x Size x Frame combination. Until Hayden's WooCommerce Products ->
 * Export CSV is available (see root README "Data migration"), this script:
 *   - prices every "Original" variant at the product's max_amount (Originals
 *     are usually the most expensive option)
 *   - prices every print variant (Canvas/Paper) at the product's min_amount
 * Once the CSV is available, replace `resolveVariantPrice` below with a real
 * lookup (join on SKU or on the Type/Size/Frame combo) — everything else in
 * this script (options, categories, images, stock) does not need to change.
 *
 * Run with: npx medusa exec ./src/scripts/seed-haydengoseek.ts
 */
import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

type CatalogAttribute = { name: string; terms: string[] }
type CatalogVariation = { id: number; attributes: Record<string, string> }
type CatalogImage = { src: string; alt: string; name: string }
type CatalogProduct = {
  id: number
  name: string
  slug: string
  sku: string
  descriptionHtml: string
  shortDescription: string
  categories: number[]
  priceRange: { min_amount: string; max_amount: string } | null
  currency: string | null
  attributes: CatalogAttribute[]
  variations: CatalogVariation[]
  images: CatalogImage[]
}
type Catalog = {
  categories: { id: number; name: string; slug: string }[]
  products: CatalogProduct[]
}

// Hayden's real photography, one subfolder per artwork (2026-09-05 resupply).
// Most folder names match the product slug once lowercased; these three don't.
const IMAGE_FOLDER_BY_HANDLE: Record<string, string> = {
  "peeking-through-the-blinds": "Peaking",
  "theres-a-storm-brewing": "Storm",
  "summer-in-the-city": "Summer",
}
const IMAGES_ROOT = path.resolve(__dirname, "../../../../Artwork-images")

function imageFolderFor(handle: string): string | null {
  const explicit = IMAGE_FOLDER_BY_HANDLE[handle]
  if (explicit) return path.join(IMAGES_ROOT, explicit)
  const entries = readdirSync(IMAGES_ROOT, { withFileTypes: true })
  const normalizedHandle = handle.replace(/-/g, "")
  const match = entries.find(
    (e) => e.isDirectory() && e.name.toLowerCase().replace(/-/g, "") === normalizedHandle
  )
  return match ? path.join(IMAGES_ROOT, match.name) : null
}

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

// Tags each local image file with the Frame/Type it visually represents, per
// Hayden's naming convention (confirmed against every folder in
// Artwork-images/):
//   <name>-og / <name>-original       -> the one-of-one Original piece. Tagged
//                                         frame: "No frame" with NO type, since
//                                         it's also reused as the "Canvas Print
//                                         + No frame" shot — see the special
//                                         case in getImageForOptions on the
//                                         storefront for why Original always
//                                         resolves to this image regardless of
//                                         its nominal (always-Oak) Frame value.
//   <name>-<black|blk|white|wht|oak>  -> Canvas Print in that frame. No type
//                                         tag either — same image doubles for
//                                         Original per above.
//   <name>-<frame>-print / -print-<frame> / <frame>print
//                                      -> Paper Print in that frame.
//   <name>-paper-print                -> Paper Print, unframed.
//   <name>-mockup*, or anything else  -> lifestyle/room shot, untagged.
function tagImageFile(filename: string): { frame?: string; type?: string } {
  const name = filename.toLowerCase()
  if (name.includes("mock")) return {}

  const isOG = /\bog\b/.test(name) || name.includes("original")
  const isPrint = name.includes("print")

  let frame: string | undefined
  if (name.includes("black") || name.includes("blk")) frame = "Black"
  else if (name.includes("white") || name.includes("wht")) frame = "White"
  else if (name.includes("oak")) frame = "Oak"

  if (isOG) return { frame: frame ?? "No frame" }
  if (isPrint) return { type: "Paper Print", frame: frame ?? "No frame" }
  if (frame) return { frame } // Canvas Print photo — no type, see header comment
  return {}
}

// The Original's photo (tagged frame: "No frame", no type — see tagImageFile)
// is what the shop grid should show for consistency, matching the special
// case in the storefront's getImageForOptions. Falls back to the first image
// if a product has no such photo.
function primaryImageUrl(images: { url: string; metadata: { frame?: string; type?: string } }[]): string | undefined {
  const original = images.find((img) => !img.metadata.type && img.metadata.frame === "No frame")
  return (original ?? images[0])?.url
}

const HTML_ENTITIES: Record<string, string> = {
  "&#8211;": "–",
  "&#8217;": "'",
  "&amp;": "&",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8230;": "…",
  "&#8216;": "'",
  "&nbsp;": " ",
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#?\w+;/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim()
}

// Placeholder only — see file header. Replace once real per-variation
// pricing (from the WooCommerce CSV export) is available.
function resolveVariantPrice(product: CatalogProduct, variation: CatalogVariation) {
  const min = Number(product.priceRange?.min_amount ?? "29500") / 100
  const max = Number(product.priceRange?.max_amount ?? min) / 100
  return variation.attributes["Type"] === "Original" ? max : min
}

export default async function seedHaydengoseek({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fileModuleService = container.resolve(Modules.FILE)

  const catalogPath = path.resolve(__dirname, "../../../../scripts/haydengoseek-import/catalog.json")
  const catalog: Catalog = JSON.parse(readFileSync(catalogPath, "utf-8"))
  logger.info(`Loaded ${catalog.products.length} products from ${catalogPath}`)

  logger.info("Seeding store, region (AU/AUD), sales channel...")
  const {
    result: [salesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: "HaydenGoSeek Storefront" }] },
  })

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [{ title: "Storefront", type: "publishable", created_by: "" }],
    },
  })
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [salesChannel.id] },
  })
  logger.info(`Publishable API key: ${publishableApiKey.token}`)

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "HaydenGoSeek",
          supported_currencies: [{ currency_code: "aud", is_default: true }],
          default_sales_channel_id: salesChannel.id,
        },
      ],
    },
  })

  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Australia",
          currency_code: "aud",
          countries: ["au"],
          // pp_stripe becomes available once STRIPE_API_KEY is set in .env —
          // see medusa-config.ts (no `id` override there — this must stay
          // exactly "pp_stripe" or webhook delivery breaks, see the comment
          // there). pp_system_default always works, for testing the flow
          // before Stripe keys are added.
          payment_providers: ["pp_system_default", "pp_stripe"],
        },
      ],
    },
  })
  const region = regionResult[0]

  // GST rate: confirm with Hayden whether current WooCommerce prices are
  // tax-inclusive (typical for an AU store) — see plan doc "Payments, Tax,
  // Shipping". Configure the actual 10% rate in the admin under this region
  // once confirmed; this just registers the tax region.
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "au", provider_id: "tp_system" }],
  })

  logger.info("Seeding stock location + shipping (placeholder rates)...")
  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        { name: "Gold Coast Studio", address: { city: "Gold Coast", country_code: "AU", address_1: "" } },
      ],
    },
  })

  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  const {
    result: [shippingProfile],
  } = await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Framed Artwork", type: "default" }] },
  })

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Australia delivery",
    type: "shipping",
    service_zones: [{ name: "Australia", geo_zones: [{ country_code: "au", type: "country" }] }],
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  // Placeholder flat rate — replace with Hayden's actual domestic/international
  // freight rates (see plan doc "Payments, Tax, Shipping").
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: { label: "Standard", description: "Placeholder rate — confirm with Hayden.", code: "standard" },
        prices: [
          { currency_code: "aud", amount: 25 },
          { region_id: region.id, amount: 25 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  })

  logger.info("Seeding categories...")
  const categoryNames = ["Art", "Music", "Vintage Wares"]
  const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: categoryNames.map((name) => ({ name, is_active: true })),
    },
  })
  const categoryIdByWooId = new Map<number, string>()
  for (const wooCat of catalog.categories) {
    const medusaCat = categoryResult.find((c) => c.name.toLowerCase() === wooCat.name.toLowerCase())
    if (medusaCat) categoryIdByWooId.set(wooCat.id, medusaCat.id)
  }

  logger.info("Uploading Hayden's artwork photography (Artwork-images/)...")
  const imagesByHandle = new Map<string, { url: string; metadata: { frame?: string; type?: string } }[]>()
  for (const product of catalog.products) {
    const folder = imageFolderFor(product.slug)
    if (!folder) {
      logger.warn(`No local image folder for "${product.slug}" — keeping the placeholder remote images.`)
      imagesByHandle.set(product.slug, product.images.map((img) => ({ url: img.src, metadata: {} })))
      continue
    }
    const files = readdirSync(folder).filter((f) => MIME_BY_EXT[path.extname(f).toLowerCase()])
    const uploaded = await fileModuleService.createFiles(
      files.map((file) => ({
        filename: file,
        mimeType: MIME_BY_EXT[path.extname(file).toLowerCase()],
        content: readFileSync(path.join(folder, file)).toString("base64"),
        access: "public" as const,
      }))
    )
    imagesByHandle.set(
      product.slug,
      uploaded.map((f, i) => ({ url: f.url, metadata: tagImageFile(files[i]) }))
    )
  }
  logger.info(`Uploaded images for ${imagesByHandle.size} products.`)

  logger.info(`Seeding ${catalog.products.length} products...`)
  // Each product declares its own Type/Size/Frame options inline (values taken
  // from that product's own attributes) rather than sharing a pre-created,
  // cross-product option set — Medusa product options belong to a single
  // product, so createProductsWorkflow's inline `{title, values}` form is the
  // right fit here (as opposed to a separate createProductOptionsWorkflow step
  // referenced by id, which is only for options meant to be reused verbatim
  // across products and isn't needed for independent artworks like these).
  await createProductsWorkflow(container).run({
    input: {
      products: catalog.products.map((product) => ({
        title: product.name,
        handle: product.slug,
        description: stripHtml(product.descriptionHtml) || product.shortDescription,
        status: ProductStatus.DRAFT, // flip to PUBLISHED once pricing is confirmed real
        shipping_profile_id: shippingProfile.id,
        category_ids: product.categories.map((id) => categoryIdByWooId.get(id)).filter((x): x is string => !!x),
        images: imagesByHandle.get(product.slug) ?? [],
        // The shop grid should consistently show the Original artwork shot
        // (see getImageForOptions' matching special case on the storefront —
        // same image, same reasoning) rather than whatever Medusa would
        // otherwise default to (the first image, in upload order — which
        // varied per product depending on filename casing).
        thumbnail: primaryImageUrl(imagesByHandle.get(product.slug) ?? []),
        options: product.attributes.map((attr) => ({ title: attr.name, values: attr.terms })),
        variants: product.variations.map((variation) => {
          const isOriginal = variation.attributes["Type"] === "Original"
          const slug = Object.values(variation.attributes).join("-").replace(/[^a-zA-Z0-9]+/g, "").toUpperCase()
          return {
            title: Object.values(variation.attributes).join(" / "),
            sku: `${product.sku}-${slug}`,
            options: variation.attributes,
            manage_inventory: isOriginal,
            prices: [{ amount: resolveVariantPrice(product, variation), currency_code: "aud" }],
          }
        }),
        sales_channels: [{ id: salesChannel.id }],
      })),
    },
  })
  logger.info("Finished seeding products (status: draft — review pricing before publishing).")

  logger.info("Seeding inventory (Original variants: qty 1; prints: unmanaged/made-to-order)...")
  const { data: inventoryItems } = await query.graph({ entity: "inventory_item", fields: ["id"] })
  if (inventoryItems.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 1,
          inventory_item_id: item.id,
        })),
      },
    })
  }

  logger.info("Done. Next: review products in the admin, fix placeholder prices/images, then publish.")
}

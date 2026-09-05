/**
 * One-off fixup: updates prices on already-seeded products from the exact
 * per-variation prices in scripts/haydengoseek-import/variation-prices.json
 * (see fetch-variation-prices.mjs and seed-haydengoseek.ts's header for
 * where that data comes from). Used instead of reseeding because reseeding
 * would try to recreate the store/region/sales-channel/products that already
 * exist in a target database and conflict on their unique handles.
 *
 * Run with: npx medusa exec ./src/scripts/update-variant-prices.ts
 */
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { readFileSync } from "node:fs"
import path from "node:path"

type VariationPrices = {
  products: {
    slug: string
    variations: { type: string; size: string; frame: string; price: number }[]
  }[]
}

export default async function updateVariantPrices({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const variationPricesPath = path.resolve(
    __dirname,
    "../../../../scripts/haydengoseek-import/variation-prices.json"
  )
  const variationPrices: VariationPrices = JSON.parse(readFileSync(variationPricesPath, "utf-8"))
  const priceLookup = new Map<string, number>()
  for (const product of variationPrices.products) {
    for (const v of product.variations) {
      priceLookup.set(`${product.slug}|${v.type}|${v.size}|${v.frame}`, v.price)
    }
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["handle", "variants.id", "variants.title", "variants.options.value", "variants.options.option.title"],
    filters: {},
  })

  const updates: { id: string; prices: { amount: number; currency_code: string }[] }[] = []
  let missing = 0
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const attrs: Record<string, string> = {}
      for (const opt of variant.options ?? []) {
        if (opt.option?.title) attrs[opt.option.title] = opt.value
      }
      const key = `${product.handle}|${attrs["Type"]}|${attrs["Size"]}|${attrs["Frame"]}`
      const price = priceLookup.get(key)
      if (price === undefined) {
        logger.warn(`No exact price for ${key} (variant ${variant.id}) — leaving as-is`)
        missing++
        continue
      }
      updates.push({ id: variant.id, prices: [{ amount: price, currency_code: "aud" }] })
    }
  }

  logger.info(`Updating ${updates.length} variants with exact prices (${missing} left unchanged)...`)
  await updateProductVariantsWorkflow(container).run({
    input: { product_variants: updates },
  })
  logger.info("Done.")
}

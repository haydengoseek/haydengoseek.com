/**
 * One-off migration: gives each existing product its own shipping profile
 * (previously all products shared one "Framed Artwork" profile) so Hayden
 * can set a custom shipping price per artwork from the admin dashboard
 * (Settings → Locations → Shipping), and adds a $0 "Local Pickup" option
 * alongside "Standard Shipping" on every one of those new profiles.
 *
 * Idempotent: skips any product that already has its own dedicated profile
 * (name `${title} Shipping`), so it's safe to re-run.
 *
 * Does NOT delete the old shared profile/option — they're left orphaned
 * (no product references them) since nothing depends on them once every
 * product has moved off. Delete them from the admin later if you want a
 * tidier Shipping list.
 *
 * Run with: npx medusa exec ./src/scripts/migrate-per-product-shipping.ts
 */
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function migratePerProductShipping({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "shipping_profile.id", "shipping_profile.name"],
  })

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "service_zones.id", "service_zones.name"],
  })
  const serviceZone = fulfillmentSets[0]?.service_zones?.[0]
  if (!serviceZone) throw new Error("No service zone found — run seed-haydengoseek.ts first.")

  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "currency_code"] })
  const region = regions[0]
  if (!region) throw new Error("No region found — run seed-haydengoseek.ts first.")

  // Preserve whatever the current flat rate actually is (in case it's been
  // changed in the admin since launch) rather than re-hardcoding $25.
  const { data: existingOptionsRaw } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "shipping_profile_id", "prices.amount", "prices.currency_code"],
  })
  const existingOptions = existingOptionsRaw as unknown as {
    id: string
    name: string
    shipping_profile_id: string
    prices?: { amount: number; currency_code: string }[]
  }[]
  const currentStandardOption = existingOptions.find(
    (o) => o.name === "Standard Shipping" && o.shipping_profile_id === products[0]?.shipping_profile?.id
  )
  const currentStandardPrice =
    currentStandardOption?.prices?.find((p) => p.currency_code === region.currency_code)?.amount ?? 25

  logger.info(
    `Migrating ${products.length} products to individual shipping profiles (Standard Shipping @ ${currentStandardPrice} ${region.currency_code}, Local Pickup @ 0)...`
  )

  let migrated = 0
  let skipped = 0

  for (const product of products) {
    if (!product.shipping_profile) {
      logger.warn(`"${product.title}" has no shipping profile — skipping.`)
      skipped++
      continue
    }
    if (product.shipping_profile.name === `${product.title} Shipping`) {
      skipped++
      continue
    }

    const {
      result: [profile],
    } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: `${product.title} Shipping`, type: "default" }] },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZone.id,
          shipping_profile_id: profile.id,
          type: { label: "Standard", description: "Flat-rate shipping.", code: "standard" },
          prices: [
            { currency_code: region.currency_code, amount: currentStandardPrice },
            { region_id: region.id, amount: currentStandardPrice },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Local Pickup",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZone.id,
          shipping_profile_id: profile.id,
          type: { label: "Pickup", description: "Collect from the Gold Coast studio.", code: "pickup" },
          prices: [
            { currency_code: region.currency_code, amount: 0 },
            { region_id: region.id, amount: 0 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })

    await updateProductsWorkflow(container).run({
      input: { products: [{ id: product.id, shipping_profile_id: profile.id }] },
    })

    logger.info(`  "${product.title}" → own profile (${profile.id}).`)
    migrated++
  }

  logger.info(
    `Done. Migrated ${migrated}, skipped ${skipped} (already migrated or no profile). ` +
      "Adjust per-product Standard Shipping prices in Settings → Locations → Shipping."
  )
}

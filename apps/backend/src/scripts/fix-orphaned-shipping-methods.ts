/**
 * One-off cleanup after the 2026-09-09 per-product shipping migration
 * (migrate-per-product-shipping.ts): any cart that already had a shipping
 * method attached *before* that migration ran is now carrying a shipping
 * method tied to the old shared "Framed Artwork" profile — which is still
 * a real, enabled shipping option (never deleted, just unused), so it
 * doesn't error, it just silently stops matching any current product's
 * (now per-product) shipping profile.
 *
 * The storefront's `initShippingIfNeeded` (apps/storefront/src/lib/cart-actions.ts)
 * only ever *adds* a method for a profile it doesn't see covered yet — it
 * never removes a stale one — so an affected cart ends up with the old
 * orphaned method AND a freshly-added correct one both attached, and
 * `cart.shippingTotal` sums every attached method: double-charged shipping
 * on any cart that already had Standard Shipping selected before the
 * migration ran.
 *
 * This finds every shipping method on an incomplete cart whose underlying
 * option's shipping_profile_id doesn't match any of that cart's *current*
 * line items' actual (live) shipping profile, and deletes it — safe,
 * since `initShippingIfNeeded` will just attach the correct one again next
 * time that cart's checkout page loads.
 *
 * Dry run by default. Add --apply to actually delete:
 *   npx medusa exec ./src/scripts/fix-orphaned-shipping-methods.ts
 *   npx medusa exec ./src/scripts/fix-orphaned-shipping-methods.ts --apply
 */
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Client } from "pg"

export default async function fixOrphanedShippingMethods({
  container,
  args,
}: {
  container: MedusaContainer
  args: string[]
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apply = args.includes("--apply")

  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()

  try {
    const { rows: methods } = await db.query<{
      method_id: string
      cart_id: string
      method_name: string
      method_profile_id: string | null
    }>(
      `select csm.id as method_id, csm.cart_id, csm.name as method_name, so.shipping_profile_id as method_profile_id
       from cart_shipping_method csm
       join cart c on c.id = csm.cart_id
       left join shipping_option so on so.id = csm.shipping_option_id
       where csm.deleted_at is null
         and c.deleted_at is null
         and c.completed_at is null`
    )

    logger.info(`Found ${methods.length} shipping method(s) on incomplete carts to check...`)

    let orphaned = 0
    for (const method of methods) {
      const { rows: itemProfiles } = await db.query<{ shipping_profile_id: string }>(
        `select distinct psp.shipping_profile_id
         from cart_line_item cli
         join product_shipping_profile psp on psp.product_id = cli.product_id
         where cli.cart_id = $1 and cli.deleted_at is null`,
        [method.cart_id]
      )
      const currentProfileIds = new Set(itemProfiles.map((r) => r.shipping_profile_id))

      if (method.method_profile_id && currentProfileIds.has(method.method_profile_id)) {
        continue
      }

      orphaned++
      logger.info(
        `  cart ${method.cart_id}: method "${method.method_name}" (${method.method_id}) belongs to ` +
          `profile ${method.method_profile_id ?? "(deleted option)"}, which none of this cart's current ` +
          `items use (they use: ${[...currentProfileIds].join(", ") || "none"}).` +
          (apply ? " Deleting." : " Would delete (dry run).")
      )
      if (apply) {
        await db.query(`delete from cart_shipping_method where id = $1`, [method.method_id])
      }
    }

    logger.info(
      `Done. ${orphaned} orphaned method(s) ${apply ? "deleted" : "found — re-run with --apply to actually delete them"}.`
    )
  } finally {
    await db.end()
  }
}

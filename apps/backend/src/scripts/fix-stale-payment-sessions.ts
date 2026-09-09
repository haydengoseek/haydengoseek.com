/**
 * One-off cleanup after the 2026-09-09 Stripe test→live cutover: any cart
 * that already had a pending payment session (created under the old
 * test-mode STRIPE_API_KEY) before the switch is now permanently stuck.
 * Medusa's payment module tries to cancel the underlying PaymentIntent via
 * the provider *before* deleting a payment session row — and Stripe
 * rejects that cancel ("No such payment_intent ... a live mode key was
 * used") since the intent only ever existed in test mode. That makes every
 * mutation on an affected cart (removing/updating a line item, or even
 * just reloading /checkout, which eagerly creates a payment session) fail
 * with a 500 — the delete always fails, so it never gets a chance to
 * create a fresh one.
 *
 * This finds every pending Stripe payment session on a not-yet-completed
 * payment collection, checks whether its underlying PaymentIntent actually
 * exists under the *current* (live) key, and deletes the DB row directly
 * for any that don't — bypassing the provider-cancel call that's failing.
 * A fresh payment session gets created automatically next time that cart's
 * checkout page loads.
 *
 * Dry run by default (just reports what it would delete). Add --apply to
 * actually delete:
 *   npx medusa exec ./src/scripts/fix-stale-payment-sessions.ts
 *   npx medusa exec ./src/scripts/fix-stale-payment-sessions.ts --apply
 */
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Client } from "pg"

export default async function fixStalePaymentSessions({
  container,
  args,
}: {
  container: MedusaContainer
  args: string[]
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apply = args.includes("--apply")
  const apiKey = process.env.STRIPE_API_KEY
  if (!apiKey) throw new Error("STRIPE_API_KEY is not set")

  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()

  try {
    const { rows: sessions } = await db.query<{ id: string; data: { id?: string } }>(
      `select ps.id, ps.data
       from payment_session ps
       join payment_collection pc on pc.id = ps.payment_collection_id
       where ps.provider_id = 'pp_stripe'
         and ps.status = 'pending'
         and ps.deleted_at is null
         and pc.completed_at is null
         and pc.deleted_at is null`
    )

    logger.info(`Found ${sessions.length} pending Stripe payment session(s) on incomplete carts to check...`)

    let stale = 0
    for (const session of sessions) {
      const intentId = session.data?.id
      if (!intentId) continue

      const res = await fetch(`https://api.stripe.com/v1/payment_intents/${intentId}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}` },
      })

      if (res.ok) {
        logger.info(`  ${session.id} (${intentId}) — OK under the current key, leaving alone.`)
        continue
      }

      const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
      stale++
      logger.info(
        `  ${session.id} (${intentId}) — STALE (${body.error?.message ?? res.status}).` +
          (apply ? " Deleting." : " Would delete (dry run).")
      )
      if (apply) {
        await db.query(`delete from payment_session where id = $1`, [session.id])
      }
    }

    logger.info(
      `Done. ${stale} stale session(s) ${apply ? "deleted" : "found — re-run with --apply to actually delete them"}.`
    )
  } finally {
    await db.end()
  }
}

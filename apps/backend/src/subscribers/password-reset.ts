import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { resetPasswordEmail } from "../modules/resend/templates"

type PasswordResetEvent = {
  entity_id: string
  actor_type: string
  token: string
}

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Only the admin dashboard has a reset-password page wired up in this
  // build — a "customer" actor_type reset (storefront account) is a no-op
  // here unless a customer-facing reset page gets added later.
  if (data.actor_type !== "user") {
    logger.info(`password-reset subscriber: ignoring reset for actor_type "${data.actor_type}"`)
    return
  }

  const adminUrl = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const resetUrl = `${adminUrl}/app/reset-password?token=${data.token}`

  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  await notificationModuleService.createNotifications([
    {
      to: data.entity_id,
      channel: "email",
      template: "reset-password",
      content: resetPasswordEmail(resetUrl),
    },
  ])
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}

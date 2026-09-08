import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { orderPlacedCustomerEmail, orderPlacedAdminEmail, type OrderEmailData } from "../modules/resend/templates"

const ADMIN_EMAILS = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean)

export default async function orderPlacedHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "items.title",
      "items.quantity",
      "items.unit_price",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
    ],
    filters: { id: data.id },
  })

  if (!order || !order.email) {
    logger.warn(`order-placed subscriber: order ${data.id} not found or has no email`)
    return
  }

  const emailData: OrderEmailData = {
    displayId: order.display_id ? Number(order.display_id) : null,
    email: order.email,
    currencyCode: order.currency_code,
    total: order.total,
    items: (order.items ?? []).filter((item) => item !== null).map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
    shippingAddress: order.shipping_address
      ? {
          firstName: order.shipping_address.first_name ?? null,
          lastName: order.shipping_address.last_name ?? null,
          address1: order.shipping_address.address_1 ?? null,
          city: order.shipping_address.city ?? null,
          province: order.shipping_address.province ?? null,
          postalCode: order.shipping_address.postal_code ?? null,
        }
      : null,
  }

  const customerEmail = orderPlacedCustomerEmail(emailData)
  const adminEmail = orderPlacedAdminEmail(emailData)

  await notificationModuleService.createNotifications([
    {
      to: order.email,
      channel: "email",
      template: "order-placed-customer",
      content: customerEmail,
    },
    ...ADMIN_EMAILS.map((to) => ({
      to,
      channel: "email",
      template: "order-placed-admin",
      content: adminEmail,
    })),
  ])
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

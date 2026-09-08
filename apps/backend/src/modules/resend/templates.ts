export type OrderEmailData = {
  displayId: number | null
  email: string
  currencyCode: string
  total: number
  items: { title: string; quantity: number; unitPrice: number }[]
  shippingAddress: {
    firstName: string | null
    lastName: string | null
    address1: string | null
    city: string | null
    province: string | null
    postalCode: string | null
  } | null
}

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

function itemsRows(order: OrderEmailData) {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #ded9d0;">${item.title} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #ded9d0;text-align:right;">${formatPrice(
            item.unitPrice * item.quantity,
            order.currencyCode
          )}</td>
        </tr>`
    )
    .join("")
}

function wrapper(heading: string, body: string) {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;background:#f7f6f3;padding:32px;color:#17140f;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;padding:32px;">
        <h1 style="font-size:20px;margin:0 0 16px;">${heading}</h1>
        ${body}
      </div>
    </div>`
}

export function orderPlacedCustomerEmail(order: OrderEmailData) {
  const orderRef = order.displayId ? `#${order.displayId}` : ""
  const address = order.shippingAddress
  const addressLine = address
    ? `${address.firstName ?? ""} ${address.lastName ?? ""}<br>${address.address1 ?? ""}<br>${address.city ?? ""} ${
        address.province ?? ""
      } ${address.postalCode ?? ""}`
    : ""

  return {
    subject: `Order ${orderRef} confirmed — HaydenGoSeek`,
    html: wrapper(
      "Thank you for your order",
      `
        <p style="font-size:14px;color:#6b6459;">Order ${orderRef} is confirmed. Here's what you ordered:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          ${itemsRows(order)}
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:16px;font-size:16px;">
          <span>Total</span><span>${formatPrice(order.total, order.currencyCode)}</span>
        </div>
        ${
          addressLine
            ? `<p style="font-size:14px;color:#6b6459;margin-top:24px;">Shipping to:<br>${addressLine}</p>`
            : ""
        }
        <p style="font-size:14px;color:#6b6459;margin-top:24px;">
          Questions? Reply to this email or reach us at info@haydengoseek.com.
        </p>
      `
    ),
  }
}

export function orderPlacedAdminEmail(order: OrderEmailData) {
  const orderRef = order.displayId ? `#${order.displayId}` : ""

  return {
    subject: `New order ${orderRef} — ${formatPrice(order.total, order.currencyCode)}`,
    html: wrapper(
      `New order ${orderRef}`,
      `
        <p style="font-size:14px;color:#6b6459;">From ${order.email}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          ${itemsRows(order)}
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:16px;font-size:16px;">
          <span>Total</span><span>${formatPrice(order.total, order.currencyCode)}</span>
        </div>
      `
    ),
  }
}

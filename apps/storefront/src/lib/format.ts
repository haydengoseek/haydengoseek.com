export function formatPrice(amount: number, currencyCode = "aud") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function formatPriceRange(min: number, max: number, currencyCode = "aud") {
  if (min === max) return formatPrice(min, currencyCode)
  return `${formatPrice(min, currencyCode)} – ${formatPrice(max, currencyCode)}`
}

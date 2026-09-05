// Publishes every product. Originally local-dev-only while pricing was a
// placeholder (see seed script's history) — safe to run against production
// now that update-variant-prices.ts has applied exact per-variation prices
// scraped from the live WooCommerce site.
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function publishAll({ container }: { container: MedusaContainer }) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({ entity: "product", fields: ["id"] })

  await updateProductsWorkflow(container).run({
    input: {
      selector: { id: products.map((p: any) => p.id) },
      update: { status: "published" as any },
    },
  })
  console.log(`Published ${products.length} products.`)
}

// Local-dev convenience: publishes every product so the storefront has real
// data to build/QA against. Pricing is still placeholder (see seed script) —
// do NOT run this against a production database. Revert with status "draft"
// per-product, or re-seed, before going live.
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

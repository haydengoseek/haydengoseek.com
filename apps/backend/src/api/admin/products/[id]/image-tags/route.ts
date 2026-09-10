/**
 * Sets metadata on a product's images — specifically the per-option tags
 * (e.g. `color`, `type`, `frame`) that the storefront's getImageForOptions
 * reads to swap the shown photo when a shopper picks a variant option.
 *
 * The stock `POST /admin/products/:id` route's Zod validator only accepts
 * `{ id?, url }` per image — metadata is silently stripped, and there's no
 * admin dashboard UI for it either. This route exists so the
 * product-image-tags widget (src/admin/widgets) has somewhere to save to,
 * going through updateProductsWorkflow directly instead (its internal DTO
 * does support image metadata).
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type ImageTagUpdate = {
  id: string
  metadata: Record<string, string | null>
}

type RequestBody = {
  images: ImageTagUpdate[]
}

export async function POST(req: MedusaRequest<RequestBody>, res: MedusaResponse) {
  const { id } = req.params
  const { images } = req.body as RequestBody

  if (!Array.isArray(images)) {
    res.status(400).json({ message: "Expected `images` to be an array" })
    return
  }

  await updateProductsWorkflow(req.scope).run({
    input: {
      selector: { id },
      update: { images: images.map((img) => ({ id: img.id, metadata: img.metadata })) },
    },
  })

  res.json({ success: true })
}

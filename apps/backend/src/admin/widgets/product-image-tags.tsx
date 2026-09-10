import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Select, Text, toast } from "@medusajs/ui"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/types"
import { sdk } from "../lib/sdk"

// Radix's Select can't use "" as an item value (it's reserved to mean
// "no selection" internally), so an explicit sentinel stands in for "this
// image isn't tagged with this option" and gets converted to a removed
// metadata key on save.
const UNSET = "__unset__"

type ImageState = Record<string, Record<string, string>>

function buildInitialState(images: AdminProduct["images"]): ImageState {
  const state: ImageState = {}
  for (const image of images ?? []) {
    if (!image) continue
    state[image.id] = {}
    for (const [key, value] of Object.entries(image.metadata ?? {})) {
      if (typeof value === "string") state[image.id][key] = value
    }
  }
  return state
}

const ProductImageTagsWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const images = product.images ?? []
  const options = (product.options ?? []).filter((o) => (o.values?.length ?? 0) > 0)
  const [state, setState] = useState<ImageState>(() => buildInitialState(images))
  const [saving, setSaving] = useState(false)

  const hasOptions = options.length > 0

  const setTag = (imageId: string, optionKey: string, value: string) => {
    setState((prev) => {
      const next = { ...prev, [imageId]: { ...prev[imageId] } }
      if (value === UNSET) {
        delete next[imageId][optionKey]
      } else {
        next[imageId][optionKey] = value
      }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await sdk.client.fetch(`/admin/products/${product.id}/image-tags`, {
        method: "POST",
        body: {
          images: images
            .filter((img): img is NonNullable<typeof img> => !!img)
            .map((img) => ({
              id: img.id,
              metadata: { ...(img.metadata ?? {}), ...state[img.id] },
            })),
        },
      })
      toast.success("Image tags saved", {
        description: "The storefront will use these the next time each variant's photo is shown.",
      })
    } catch (err) {
      toast.error("Failed to save image tags", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!images.length) return null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Image variant tags</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Tag each image with the option value(s) it shows, so the storefront swaps to it when a
            shopper picks a matching variant. Leave an image untagged to use it as a generic fallback.
          </Text>
        </div>
        <Button size="small" onClick={handleSave} isLoading={saving}>
          Save changes
        </Button>
      </div>

      {!hasOptions ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            This product has no options with values yet — add options (e.g. Color) before tagging
            images.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {images
            .filter((img): img is NonNullable<typeof img> => !!img)
            .map((image) => (
              <div key={image.id} className="flex flex-col gap-y-2 rounded-lg border p-3">
                <img
                  src={image.url}
                  alt=""
                  className="h-40 w-full rounded-md border object-cover"
                />
                {options.map((option) => {
                  const key = option.title.toLowerCase()
                  const current = state[image.id]?.[key] ?? UNSET
                  return (
                    <div key={option.id} className="flex flex-col gap-y-1">
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {option.title}
                      </Text>
                      <Select value={current} onValueChange={(v) => setTag(image.id, key, v)}>
                        <Select.Trigger>
                          <Select.Value placeholder="Not tagged" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value={UNSET}>Not tagged</Select.Item>
                          {(option.values ?? []).map((v) => (
                            <Select.Item key={v.id} value={v.value}>
                              {v.value}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  )
                })}
              </div>
            ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductImageTagsWidget

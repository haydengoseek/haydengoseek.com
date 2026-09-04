import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  description:
    'Editorial overlay for a Medusa product. Holds the story/description and lifestyle ' +
    'gallery shots for one artwork — price, variants, stock and the Type/Size/Frame swatch ' +
    'images live in Medusa, not here. Joined to Medusa at render time via medusaHandle.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'For reference in the Studio — should match the artwork name in Medusa.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'medusaHandle',
      title: 'Medusa product handle',
      type: 'string',
      description: 'Must exactly match the handle/slug of the corresponding product in Medusa.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      description: 'e.g. "Acrylic on canvas — Oak float frame"',
    }),
    defineField({
      name: 'story',
      title: 'Story / description',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'gallery',
      title: 'Lifestyle gallery',
      description: 'Room-mockup / lifestyle shots — separate from the transactional swatch images in Medusa.',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    select: {title: 'title', media: 'gallery.0'},
  },
})

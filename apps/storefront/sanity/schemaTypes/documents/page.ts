import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Additional Pages',
  type: 'document',
  description: 'Generic flat content pages (e.g. Contact, Shipping & Returns) not covered by a dedicated schema.',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

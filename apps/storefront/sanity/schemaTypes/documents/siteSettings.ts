import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  description: 'Singleton — only one of these should exist.',
  fields: [
    defineField({name: 'title', title: 'Site title', type: 'string'}),
    defineField({name: 'logo', title: 'Logo', description: 'Used on light backgrounds (header)', type: 'image'}),
    defineField({
      name: 'logoReverse',
      title: 'Logo (reverse)',
      description: 'Light/white version for dark backgrounds (footer). Falls back to Logo if not set.',
      type: 'image',
    }),
    defineField({
      name: 'navLinks',
      title: 'Navigation links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string'},
            {name: 'href', type: 'string'},
          ],
        },
      ],
    }),
    defineField({name: 'contactEmail', title: 'Contact email', type: 'string'}),
    defineField({name: 'contactPhone', title: 'Contact phone', type: 'string'}),
    defineField({name: 'address', title: 'Address', type: 'text', rows: 2}),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'platform', type: 'string'},
            {name: 'url', type: 'url'},
          ],
        },
      ],
    }),
    defineField({name: 'footerText', title: 'Footer text', type: 'text', rows: 2}),
  ],
})

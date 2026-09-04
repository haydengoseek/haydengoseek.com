import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  description: 'Singleton — only one of these should exist.',
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'subheading', title: 'Subheading', type: 'text', rows: 2}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'primaryCta', title: 'Primary button', type: 'cta'}),
    defineField({
      name: 'collectionTeasers',
      title: 'Collection teasers',
      description: '"Original Artworks", "Framed Prints", "Limited Editions" style teaser cards.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', type: 'string'},
            {name: 'description', type: 'text', rows: 2},
            {name: 'image', type: 'image', options: {hotspot: true}},
            {
              name: 'medusaCategoryHandle',
              title: 'Medusa category handle',
              type: 'string',
              description: 'Which Medusa product category this teaser links to.',
            },
          ],
        },
      ],
    }),
    defineField({name: 'introHeading', title: 'Intro heading', type: 'string'}),
    defineField({
      name: 'introBody',
      title: 'Intro text',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'showFaqSection',
      title: 'Show FAQ section',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

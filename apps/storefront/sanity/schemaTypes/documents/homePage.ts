import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  description: 'Singleton — only one of these should exist.',
  groups: [
    {name: 'hero', title: 'Hero'},
    {name: 'carousel', title: 'Artworks carousel'},
    {name: 'team', title: 'Artist section'},
    {name: 'faq', title: 'FAQ section'},
    {name: 'contact', title: 'Contact section'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'zoomHeading', title: 'Closing statement heading', type: 'string'}),
        defineField({name: 'revealLabel', title: 'Reveal label', type: 'string'}),
        defineField({name: 'revealStatement', title: 'Reveal statement', type: 'text', rows: 4}),
        defineField({name: 'cta', title: 'Button', type: 'cta'}),
        defineField({name: 'backdropImage', title: 'Backdrop image', type: 'image', options: {hotspot: true}}),
        defineField({name: 'insetRevealImage', title: 'Inset reveal image', type: 'image', options: {hotspot: true}}),
        defineField({name: 'closingImage', title: 'Closing image', type: 'image', options: {hotspot: true}}),
        defineField({name: 'scrollLabel', title: 'Scroll hint label', type: 'string'}),
        defineField({name: 'sectionLabel', title: 'Section label (e.g. "01 — Introduction")', type: 'string'}),
      ],
    }),
    defineField({
      name: 'artworksCarousel',
      title: 'Artworks carousel',
      type: 'object',
      group: 'carousel',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
      ],
    }),
    defineField({
      name: 'teamSlider',
      title: 'Artist section',
      type: 'object',
      group: 'team',
      fields: [defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'})],
    }),
    defineField({
      name: 'faqSection',
      title: 'FAQ section',
      type: 'object',
      group: 'faq',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'showSection', title: 'Show FAQ section', type: 'boolean', initialValue: true}),
      ],
    }),
    defineField({
      name: 'contactSection',
      title: 'Contact section',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({
          name: 'headingLines',
          title: 'Heading lines',
          description: 'Rendered one per line, e.g. "Say g\'day," / "let\'s chat"',
          type: 'array',
          of: [{type: 'string'}],
        }),
        defineField({name: 'note', title: 'Note', type: 'text', rows: 2}),
        defineField({name: 'directEmail', title: 'Direct email', type: 'string'}),
        defineField({name: 'studioAddress', title: 'Studio address', type: 'text', rows: 2}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
})

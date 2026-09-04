import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'artistBio',
  title: 'Artist Bio',
  type: 'document',
  description: 'Singleton — only one of these should exist.',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'tagline', title: 'Tagline', type: 'string'}),
    defineField({name: 'portrait', title: 'Portrait', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],
})

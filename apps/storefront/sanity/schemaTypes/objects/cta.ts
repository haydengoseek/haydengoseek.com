import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string'}),
    defineField({name: 'url', title: 'URL', type: 'string'}),
  ],
})

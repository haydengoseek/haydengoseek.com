import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  description: 'Singleton — only one of these should exist.',
  groups: [
    {name: 'header', title: 'Header'},
    {name: 'footer', title: 'Footer'},
    {name: 'contact', title: 'Contact details'},
  ],
  fields: [
    defineField({name: 'title', title: 'Site name', type: 'string', group: 'header'}),
    defineField({
      name: 'announcementText',
      title: 'Announcement bar text',
      type: 'string',
      group: 'header',
    }),
    defineField({
      name: 'navLinks',
      title: 'Navigation links',
      type: 'array',
      group: 'header',
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
    defineField({name: 'contactEmail', title: 'Contact email', type: 'string', group: 'contact'}),
    defineField({name: 'contactPhone', title: 'Contact phone', type: 'string', group: 'contact'}),
    defineField({name: 'address', title: 'Address', type: 'text', rows: 2, group: 'contact'}),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
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
    defineField({
      name: 'footerColumns',
      title: 'Footer link columns',
      type: 'array',
      group: 'footer',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'heading', title: 'Heading', type: 'string'},
            {
              name: 'links',
              title: 'Links',
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
            },
          ],
        },
      ],
    }),
    defineField({name: 'newsletterHeading', title: 'Newsletter heading', type: 'string', group: 'footer'}),
    defineField({name: 'newsletterBody', title: 'Newsletter body', type: 'text', rows: 2, group: 'footer'}),
    defineField({name: 'newsletterPlaceholder', title: 'Newsletter input placeholder', type: 'string', group: 'footer'}),
    defineField({name: 'copyrightName', title: 'Copyright name', type: 'string', group: 'footer'}),
  ],
})

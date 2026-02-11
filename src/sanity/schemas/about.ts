import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Designer & Creative Technologist',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'portableText',
      description: 'Main biography content (rich text with paragraphs)',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['lqip', 'palette'],
      },
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' };
    },
  },
});

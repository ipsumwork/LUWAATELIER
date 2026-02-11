import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'LUWA',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      description: 'Used for SEO metadata',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [{ type: 'socialLink' }],
    }),
    defineField({
      name: 'heroBackgroundColor',
      title: 'Hero Background Color',
      type: 'color',
      description: 'Background color for the homepage hero (visible behind media or as fallback)',
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero Media',
      type: 'file',
      description: 'Background media for the homepage hero (GIF, MP4, or WebM)',
      options: {
        accept: 'image/gif,video/mp4,video/webm',
      },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Configuration' };
    },
  },
});

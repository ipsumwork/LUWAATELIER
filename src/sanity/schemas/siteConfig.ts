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
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
      description: 'Large text in the footer (e.g. "SHOP OPEN 9-5")',
      initialValue: 'SHOP OPEN 9-5',
    }),
    defineField({
      name: 'footerName',
      title: 'Footer Name',
      type: 'string',
      description: 'Name displayed in the footer offline column',
      initialValue: 'L.WANELOF',
    }),
    defineField({
      name: 'footerPhone',
      title: 'Footer Phone',
      type: 'string',
      description: 'Phone number in the footer offline column',
      initialValue: '(+46)',
    }),
    defineField({
      name: 'footerBrandText',
      title: 'Footer Brand Text',
      type: 'string',
      description: 'Large brand text at the bottom of the footer',
      initialValue: 'LUWA ATELIER',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Configuration' };
    },
  },
});

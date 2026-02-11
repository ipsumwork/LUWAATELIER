import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Twitter/X', value: 'twitter' },
          { title: 'GitHub', value: 'github' },
          { title: 'Behance', value: 'behance' },
          { title: 'Dribbble', value: 'dribbble' },
        ],
      },
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
    }),
  ],
  preview: {
    select: { platform: 'platform', url: 'url' },
    prepare({ platform, url }) {
      return { title: platform, subtitle: url };
    },
  },
});

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orderIndex',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first (1, 2, 3...)',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.min(2000).max(2030),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g., "Creative Direction, AI Research"',
    }),
    defineField({
      name: 'tools',
      title: 'Tools',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'portableText',
    }),
    defineField({
      name: 'processSteps',
      title: 'Process Steps',
      type: 'array',
      of: [{ type: 'processStep' }],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['lqip', 'palette'],
      },
      description: 'Static image for hero. Use Hero Video below for animated content.',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video/GIF',
      type: 'file',
      options: {
        accept: 'video/mp4,video/webm,video/quicktime,image/gif',
      },
      description: 'Animated hero content (MP4, WebM, GIF). Takes precedence over Hero Image if set.',
    }),
    defineField({
      name: 'enableVideoPlayer',
      title: 'Enable Video Player',
      type: 'boolean',
      description: 'When checked, the hero video will display with playback controls and a floating mini-player (like a QuickTime player). When unchecked, the video plays as a simple background loop with no controls.',
      initialValue: false,
    }),
    defineField({
      name: 'heroImageConfig',
      title: 'Hero Image Config',
      type: 'object',
      description: 'Visual editor settings (managed automatically)',
      hidden: true,
      fields: [
        {
          name: 'width',
          title: 'Width (%)',
          type: 'number',
          validation: (Rule) => Rule.min(20).max(100),
        },
        {
          name: 'aspectRatio',
          title: 'Aspect Ratio',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images & Videos',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true, metadata: ['lqip'] },
          fields: [
            { name: 'alt', title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
        {
          type: 'file',
          title: 'Video',
          options: {
            accept: 'video/mp4,video/webm,video/quicktime,image/gif',
          },
          fields: [
            { name: 'alt', title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'customComponent',
      title: 'Custom Component',
      type: 'string',
      options: {
        list: [
          { title: 'Intelligence Diagram', value: 'IntelligenceDiagram' },
          { title: 'Flip Book (Mise en Place)', value: 'FlipBook' },
          { title: 'None', value: 'none' },
        ],
      },
      description: 'Optional custom React component to render instead of hero image',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'heroImage', orderIndex: 'orderIndex' },
    prepare({ title, media, orderIndex }) {
      return {
        title: `(${orderIndex || '?'}) ${title}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderIndexAsc',
      by: [{ field: 'orderIndex', direction: 'asc' }],
    },
  ],
});

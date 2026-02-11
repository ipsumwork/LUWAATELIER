'use client'

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { colorInput } from '@sanity/color-input';
import { projectId, dataset, apiVersion } from './src/sanity/config';
import { schemaTypes } from './src/sanity/schemas';
import { structure } from './src/sanity/studio/structure';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'LUWA Portfolio CMS',
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    colorInput(),
  ],
});

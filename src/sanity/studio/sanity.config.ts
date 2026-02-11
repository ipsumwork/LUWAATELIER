import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { projectId, dataset } from '../config';
import { schemaTypes } from '../schemas';
import { structure } from './structure';

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
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],
});

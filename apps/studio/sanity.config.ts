import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
// Canonical schema lives in apps/storefront/sanity/schemaTypes (the embedded
// /studio route on the live storefront is the primary way this gets used;
// this standalone local Studio just points at the same source).
import {schemaTypes} from '../storefront/sanity/schemaTypes'

export default defineConfig({
  name: 'haydengoseek',
  title: 'HaydenGoSeek',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})

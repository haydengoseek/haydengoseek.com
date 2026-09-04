import {defineCliConfig} from 'sanity/cli'

// Fill in once the real Sanity project is created at sanity.io/manage.
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})

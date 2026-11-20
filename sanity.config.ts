import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './sanity/schemas'
export default defineConfig({
  name: 'default', title: 'Store Studio', basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  schema: {types: schemaTypes},
  plugins: [structureTool({structure: (S) => S.list().title('Content').items([
    S.listItem().title('Site settings').id('siteSettings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    S.divider(),
    ...S.documentTypeListItems().filter((i) => i.getId() !== 'siteSettings'),
  ])})],
  document: {actions: (prev, {schemaType}) => schemaType === 'siteSettings' ? prev.filter((a) => a.action !== 'delete' && a.action !== 'duplicate') : prev},
})

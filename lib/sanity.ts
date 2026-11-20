import 'server-only'
import {createClient} from 'next-sanity'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01', useCdn: false, token: process.env.SANITY_API_READ_TOKEN,
})
export const q = <T>(query: string, params: Record<string, unknown> = {}) =>
  client.fetch<T>(query, params, {next: {tags: ['sanity']}})

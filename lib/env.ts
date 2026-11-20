import 'server-only'
import {z} from 'zod'
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  SANITY_API_READ_TOKEN: z.string().min(1),
  SANITY_REVALIDATE_SECRET: z.string().min(16),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
})
let cached: z.infer<typeof schema> | undefined
export const env = () => (cached ??= schema.parse(process.env))

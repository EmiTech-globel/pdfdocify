import {type NextRequest} from 'next/server'
import {parseBody} from 'next-sanity/webhook'
import {revalidateTag} from 'next/cache'
import {env} from '@/lib/env'
// Sanity calls this when you publish, so edits go live without a redeploy.
export async function POST(req: NextRequest) {
  const {isValidSignature} = await parseBody(req, env().SANITY_REVALIDATE_SECRET)
  if (!isValidSignature) return new Response('invalid signature', {status: 401})
  revalidateTag('sanity')
  return Response.json({ok: true})
}

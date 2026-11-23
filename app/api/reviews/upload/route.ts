import {NextResponse} from 'next/server'
import {auth} from '@clerk/nextjs/server'
import crypto from 'node:crypto'
import {z} from 'zod'
import {env} from '@/lib/env'
import {allow} from '@/lib/limit'
import {presignPut} from '@/lib/r2'
import {myReview, ownsGuide} from '@/lib/reviews'
import {LIMITS, extOf, kindOf, maxBytes} from '@/lib/review-rules'

const body = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  files: z.array(z.object({type: z.string().max(60), size: z.number().int().positive()})).min(1).max(LIMITS.images + LIMITS.videos),
})
const err = (error: string, status: number) => NextResponse.json({error}, {status})

// Step 1 of posting a review with media: validate the files and hand back short-lived upload URLs.
export async function POST(req: Request) {
  if (req.headers.get('origin') !== env().NEXT_PUBLIC_SITE_URL) return err('forbidden', 403)
  const {userId} = await auth()
  if (!userId) return err('auth', 401)
  if (!(await allow(`review-upload:${userId}`))) return err('rate_limited', 429)
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return err('bad_request', 400)
  const {slug, files} = parsed.data
  if (!(await ownsGuide(slug, userId))) return err('not_purchased', 403)
  if (await myReview(slug, userId)) return err('already_reviewed', 409)

  let images = 0, videos = 0
  for (const f of files) {
    const kind = kindOf(f.type)
    if (!kind) return err('bad_type', 400)
    if (f.size > maxBytes(kind)) return err(kind === 'image' ? 'image_too_large' : 'video_too_large', 400)
    if (kind === 'image') images++; else videos++
  }
  if (images > LIMITS.images) return err('too_many_images', 400)
  if (videos > LIMITS.videos) return err('too_many_videos', 400)

  const uploads = await Promise.all(files.map(async (f) => {
    const key = `review-tmp/${userId}/${crypto.randomUUID()}.${extOf(f.type)}`
    return {key, type: f.type, url: await presignPut(key, f.type)}
  }))
  return NextResponse.json({uploads})
}

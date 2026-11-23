import {NextResponse} from 'next/server'
import {auth} from '@clerk/nextjs/server'
import {revalidatePath} from 'next/cache'
import {z} from 'zod'
import {db} from '@/lib/db'
import {env} from '@/lib/env'
import {allow} from '@/lib/limit'
import {deleteObject, headObject, moveObject} from '@/lib/r2'
import {myReview, ownsGuide} from '@/lib/reviews'
import {LIMITS, extOf, kindOf, maxBytes} from '@/lib/review-rules'

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
const body = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  rating: z.number().int().min(1).max(5),
  displayName: z.string().transform(clean).pipe(z.string().min(1).max(40)),
  title: z.string().transform(clean).pipe(z.string().max(80)).optional(),
  body: z.string().transform(clean).pipe(z.string().min(10).max(2000)),
  media: z.array(z.object({key: z.string().max(200), type: z.string().max(60), size: z.number().int().positive()})).max(LIMITS.images + LIMITS.videos).default([]),
})
const err = (error: string, status: number) => NextResponse.json({error}, {status})
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Step 2: store the review. Media is checked in R2 before it is accepted; reviews wait for approval.
export async function POST(req: Request) {
  if (req.headers.get('origin') !== env().NEXT_PUBLIC_SITE_URL) return err('forbidden', 403)
  const {userId} = await auth()
  if (!userId) return err('auth', 401)
  if (!(await allow(`review:${userId}`))) return err('rate_limited', 429)
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return err('bad_request', 400)
  const d = parsed.data
  if (!(await ownsGuide(d.slug, userId))) return err('not_purchased', 403)
  if (await myReview(d.slug, userId)) return err('already_reviewed', 409)

  // Every key must be one we issued to this user, and unique.
  const keyRe = new RegExp(`^review-tmp/${esc(userId)}/[0-9a-f-]{36}\\.(jpg|png|webp|mp4|webm|mov)$`)
  if (new Set(d.media.map((m) => m.key)).size !== d.media.length || d.media.some((m) => !keyRe.test(m.key))) return err('bad_media', 400)
  const checked: {key: string; kind: 'image' | 'video'; type: string; size: number}[] = []
  const discard = () => Promise.all(d.media.map((m) => deleteObject(m.key)))
  let images = 0, videos = 0
  for (const m of d.media) {
    const kind = kindOf(m.type)
    if (!kind || !m.key.endsWith(`.${extOf(m.type)}`)) { await discard(); return err('bad_media', 400) }
    const head = await headObject(m.key)
    if (!head || head.size > maxBytes(kind) || head.type !== m.type) { await discard(); return err('bad_media', 400) }
    checked.push({key: m.key, kind, type: m.type, size: head.size})
    if (kind === 'image') images++; else videos++
  }
  if (images > LIMITS.images || videos > LIMITS.videos) { await discard(); return err('bad_media', 400) }

  const sql = db()
  let reviewId: string
  try {
    const [row] = await sql`insert into reviews (product_slug, clerk_user_id, display_name, rating, title, body)
      values (${d.slug}, ${userId}, ${d.displayName}, ${d.rating}, ${d.title || null}, ${d.body}) returning id`
    reviewId = row.id as string
  } catch (e) {
    await discard()
    return (e as {code?: string}).code === '23505' ? err('already_reviewed', 409) : err('server_error', 500)
  }
  try {
    for (const m of checked) {
      const finalKey = `reviews/${reviewId}/${m.key.split('/').pop()}`
      await moveObject(m.key, finalKey)
      await sql`insert into review_media (review_id, object_key, kind, content_type, size_bytes) values (${reviewId}, ${finalKey}, ${m.kind}, ${m.type}, ${m.size})`
    }
  } catch {
    await sql`delete from reviews where id = ${reviewId}`
    await discard()
    return err('server_error', 502)
  }
  revalidatePath('/admin/reviews')
  return NextResponse.json({ok: true, status: 'pending'}, {status: 201})
}

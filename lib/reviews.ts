import 'server-only'
import {db} from './db'

export type ReviewMedia = {id: string; kind: 'image' | 'video'; contentType: string}
export type Review = {
  id: string; productSlug: string; userId: string; name: string; rating: number; title: string | null
  body: string; status: 'pending' | 'approved' | 'rejected'; createdAt: Date; media: ReviewMedia[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function group(rows: any[]): Review[] {
  const out = new Map<string, Review>()
  for (const r of rows) {
    let rv = out.get(r.id)
    if (!rv) {
      rv = {id: r.id, productSlug: r.product_slug, userId: r.clerk_user_id, name: r.display_name, rating: r.rating, title: r.title,
        body: r.body, status: r.status, createdAt: new Date(r.created_at), media: []}
      out.set(r.id, rv)
    }
    if (r.media_id) rv.media.push({id: r.media_id, kind: r.kind, contentType: r.content_type})
  }
  return [...out.values()]
}

export async function approvedReviews(slug: string, limit = 20) {
  const rows = await db()`
    select r.id, r.product_slug, r.clerk_user_id, r.display_name, r.rating, r.title, r.body, r.status, r.created_at,
           m.id as media_id, m.kind, m.content_type
    from (select * from reviews where product_slug = ${slug} and status = 'approved' order by created_at desc limit ${limit}) r
    left join review_media m on m.review_id = r.id
    order by r.created_at desc, m.created_at`
  return group(rows)
}

export async function ratingSummary(slug: string) {
  const rows = await db()`select rating, count(*)::int as n from reviews where product_slug = ${slug} and status = 'approved' group by rating`
  const dist: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
  let count = 0, sum = 0
  for (const r of rows) { const star = Number(r.rating), n = Number(r.n); dist[star] = n; count += n; sum += star * n }
  return {avg: count ? sum / count : 0, count, dist}
}

// Average rating and count for every guide that has approved reviews, keyed by slug.
export async function ratingsBySlug() {
  const rows = await db()`select product_slug, avg(rating)::float as avg, count(*)::int as count from reviews where status = 'approved' group by product_slug`
  const out: Record<string, {avg: number; count: number}> = {}
  for (const r of rows) out[r.product_slug as string] = {avg: Number(r.avg), count: Number(r.count)}
  return out
}

export async function myReview(slug: string, userId: string) {
  const [row] = await db()`select id, status from reviews where product_slug = ${slug} and clerk_user_id = ${userId}`
  return row ? {id: row.id as string, status: row.status as Review['status']} : null
}

export async function ownsGuide(slug: string, userId: string) {
  const rows = await db()`select 1 from entitlements where clerk_user_id = ${userId} and product_slug = ${slug}`
  return rows.length > 0
}

export async function reviewsByStatus(status: Review['status'], limit = 100) {
  const rows = await db()`
    select r.id, r.product_slug, r.clerk_user_id, r.display_name, r.rating, r.title, r.body, r.status, r.created_at,
           m.id as media_id, m.kind, m.content_type
    from (select * from reviews where status = ${status} order by created_at desc limit ${limit}) r
    left join review_media m on m.review_id = r.id
    order by r.created_at desc, m.created_at`
  return group(rows)
}

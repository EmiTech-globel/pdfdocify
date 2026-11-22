import 'server-only'
import {db} from '@/lib/db'
import {q} from '@/lib/sanity'
import type {Prod} from '@/lib/queries'

// The guides a user owns, newest purchase first.
export async function libraryFor(userId: string): Promise<Prod[]> {
  const rows = await db()`select product_slug from entitlements where clerk_user_id = ${userId} order by granted_at desc`
  const slugs = rows.map((r) => r.product_slug as string)
  if (!slugs.length) return []
  const guides = await q<Prod[]>(`*[_type=="product"&&slug.current in $s]{_id,title,"slug":slug.current,pages,version,coverColor,"coverUrl":coverImage.asset->url,price,fileSizeMb}`, {s: slugs})
  return slugs.map((s) => guides.find((g) => g.slug === s)).filter(Boolean) as Prod[]
}

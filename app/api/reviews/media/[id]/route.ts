import {NextResponse} from 'next/server'
import {auth} from '@clerk/nextjs/server'
import {db} from '@/lib/db'
import {isAdmin} from '@/lib/admin'
import {presignView} from '@/lib/r2'

// Stable URL for review photos and videos. Approved media is public; pending media only shows to its author and admins.
export async function GET(_: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse('not found', {status: 404})
  const [row] = await db()`select m.object_key, m.content_type, r.status, r.clerk_user_id
    from review_media m join reviews r on r.id = m.review_id where m.id = ${id}`
  if (!row) return new NextResponse('not found', {status: 404})
  const approved = row.status === 'approved'
  if (!approved) {
    const {userId} = await auth()
    if (!userId || !(isAdmin(userId) || userId === row.clerk_user_id)) return new NextResponse('not found', {status: 404})
  }
  const res = NextResponse.redirect(await presignView(row.object_key as string, row.content_type as string), 302)
  res.headers.set('Cache-Control', approved ? 'public, max-age=600' : 'private, no-store')
  return res
}

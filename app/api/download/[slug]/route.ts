import {NextResponse} from 'next/server'
import {auth} from '@clerk/nextjs/server'
import {q} from '@/lib/sanity'
import {db} from '@/lib/db'
import {signedDownload} from '@/lib/r2'
import {allow} from '@/lib/limit'
export async function GET(_: Request, {params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return new NextResponse('bad request', {status: 400})
  const {userId} = await auth()
  if (!userId) return new NextResponse('sign in required', {status: 401})
  if (!(await allow(`download:${userId}`))) return new NextResponse('too many requests', {status: 429})
  const owned = await db()`select 1 from entitlements where clerk_user_id = ${userId} and product_slug = ${slug}`
  if (!owned.length) return new NextResponse('not purchased', {status: 403})
  const p = await q<{fileKey?: string} | null>(`*[_type=="product"&&slug.current==$slug][0]{fileKey}`, {slug})
  if (!p?.fileKey) return new NextResponse('file missing', {status: 404})
  const res = NextResponse.redirect(await signedDownload(p.fileKey, `${slug}.pdf`), 302)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

import {NextResponse} from 'next/server'
import {auth, currentUser} from '@clerk/nextjs/server'
import crypto from 'node:crypto'
import {z} from 'zod'
import {q} from '@/lib/sanity'
import {db} from '@/lib/db'
import {initialize} from '@/lib/paystack'
import {allow} from '@/lib/limit'
import {env} from '@/lib/env'

const body = z.object({items: z.array(z.object({type: z.enum(['product', 'bundle']), slug: z.string().regex(/^[a-z0-9-]{1,80}$/)})).min(1).max(20)})
type Row = {title: string; slug: string; price: number}
type BundleRow = {title: string; slug: string; price: number; items: Row[] | null}
const err = (error: string, status: number) => NextResponse.json({error}, {status})

export async function POST(req: Request) {
  if (req.headers.get('origin') !== env().NEXT_PUBLIC_SITE_URL) return err('forbidden', 403)
  const {userId} = await auth()
  if (!userId) return err('auth', 401)
  if (!(await allow(`checkout:${userId}`))) return err('rate_limited', 429)
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return err('bad_request', 400)
  const email = (await currentUser())?.primaryEmailAddress?.emailAddress
  if (!email) return err('email_required', 400)

  const pick = (t: string) => [...new Set(parsed.data.items.filter((i) => i.type === t).map((i) => i.slug))]
  const [pSlugs, bSlugs] = [pick('product'), pick('bundle')]
  // Prices come from Sanity on the server. Anything the browser sends about price is ignored.
  const [products, bundles] = await Promise.all([
    q<Row[]>(`*[_type=="product"&&active==true&&slug.current in $s]{title,price,"slug":slug.current}`, {s: pSlugs}),
    q<BundleRow[]>(`*[_type=="bundle"&&active==true&&slug.current in $s]{title,price,"slug":slug.current,"items":products[active==true]->{title,price,"slug":slug.current}}`, {s: bSlugs}),
  ])
  if (products.length !== pSlugs.length || bundles.length !== bSlugs.length) return err('item_unavailable', 400)

  const grant = new Map<string, string>()
  products.forEach((p) => grant.set(p.slug, p.title))
  bundles.forEach((b) => (b.items ?? []).forEach((p) => grant.set(p.slug, p.title)))
  const total = [...products, ...bundles].reduce((n, x) => n + x.price, 0)
  const amountKobo = Math.round(total * 100)
  if (!amountKobo) return err('bad_total', 400)

  const sql = db()
  const owned = new Set((await sql`select product_slug from entitlements where clerk_user_id = ${userId}`).map((r) => r.product_slug as string))
  if ([...grant.keys()].every((s) => owned.has(s))) return err('already_owned', 409)

  const reference = `trx_${crypto.randomUUID().replace(/-/g, '')}`
  const [order] = await sql`insert into orders (reference, clerk_user_id, email, amount_kobo) values (${reference}, ${userId}, ${email}, ${amountKobo}) returning id`
  await Promise.all([...grant].map(([slug, title]) => sql`insert into order_items (order_id, product_slug, title) values (${order.id}, ${slug}, ${title})`))
  try {
    const {authorization_url} = await initialize({email, amountKobo, reference, callbackUrl: `${env().NEXT_PUBLIC_SITE_URL}/checkout/success`, metadata: {orderId: String(order.id)}})
    return NextResponse.json({url: authorization_url})
  } catch {
    await sql`update orders set status = 'failed' where id = ${order.id}`
    return err('payment_unavailable', 502)
  }
}

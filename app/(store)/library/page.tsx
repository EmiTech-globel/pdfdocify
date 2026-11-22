import Link from 'next/link'
import {auth} from '@clerk/nextjs/server'
import {db} from '@/lib/db'
import {q} from '@/lib/sanity'
import Cover from '@/components/Cover'
import type {Prod} from '@/lib/queries'
export const metadata = {title: 'My library'}
export const dynamic = 'force-dynamic'
export default async function Library() {
  const {userId} = await auth()
  const rows = await db()`select product_slug from entitlements where clerk_user_id = ${userId!} order by granted_at desc`
  const slugs = rows.map((r) => r.product_slug as string)
  const guides = slugs.length ? await q<Prod[]>(`*[_type=="product"&&slug.current in $s]{_id,title,"slug":slug.current,pages,version,coverColor,"coverUrl":coverImage.asset->url,price}`, {s: slugs}) : []
  return (
    <section className="wrap">
      <div className="row" style={{marginBottom: 24}}><h1 style={{fontSize: 40}}>My library</h1><Link href="/account" style={{fontWeight: 600}}>Account settings</Link></div>
      {!guides.length ? <p className="mute">You have no guides yet. <Link href="/" style={{fontWeight: 600}}>Browse the shop</Link>.</p> : (
        <div className="panel">{guides.map((g) => (
          <div className="line" key={g._id}>
            <div style={{width: 84}}><Cover title="" color={g.coverColor} image={g.coverUrl} size="sm" /></div>
            <div style={{flex: 1}}><strong>{g.title}</strong><div className="mute" style={{fontSize: 14}}>PDF{g.pages ? `, ${g.pages} pages` : ''}{g.version ? ` / Version ${g.version}` : ''}</div></div>
            <a className="btn sm" href={`/api/download/${g.slug}`}>Download PDF</a>
          </div>))}
          </div>)}
    </section>
  )
}
import Link from 'next/link'
import {q} from '@/lib/sanity'
import {naira} from '@/lib/queries'
import {ratingsBySlug} from '@/lib/reviews'
import {salesBySlug} from '@/lib/admin-data'
import {PageHead, Table, btnCls, td, th} from '@/components/admin/ui'

export const metadata = {title: 'Guides'}

type G = {_id: string; title: string; slug: string; price: number; active?: boolean; category?: string; pages?: number}

export default async function AdminGuides() {
  const [guides, sales, ratings] = await Promise.all([
    q<G[]>(`*[_type=="product"]{_id,title,"slug":slug.current,price,active,category,pages}|order(_createdAt desc)`),
    salesBySlug().catch(() => ({} as Record<string, number>)),
    ratingsBySlug().catch(() => ({} as Record<string, {avg: number; count: number}>)),
  ])
  return (
    <>
      <PageHead title="Guides" sub="Content, prices and PDFs are edited in the Studio. This page shows how each guide is doing.">
        <a href="/studio" className={`${btnCls} bg-accent text-white`}>Open Studio</a>
      </PageHead>
      <Table>
        <thead><tr className="border-b border-line"><th className={th}>Guide</th><th className={th}>Category</th><th className={th}>Price</th><th className={th}>Sold</th><th className={th}>Rating</th><th className={th}>Status</th><th className={th}></th></tr></thead>
        <tbody>
          {guides.map((g) => (
            <tr key={g._id} className="border-b border-line last:border-0">
              <td className={`${td} max-w-[260px]`}><Link href={`/guides/${g.slug}`} className="font-semibold">{g.title}</Link></td>
              <td className={td}>{g.category ?? '-'}</td>
              <td className={`${td} whitespace-nowrap`}>{naira(g.price)}</td>
              <td className={td}>{sales[g.slug] ?? 0}</td>
              <td className={`${td} whitespace-nowrap`}>{ratings[g.slug] ? `${ratings[g.slug].avg.toFixed(1)} (${ratings[g.slug].count})` : '-'}</td>
              <td className={td}>{g.active === false ? 'Hidden' : 'Live'}</td>
              <td className={`${td} text-right`}><a href={`/studio/intent/edit/id=${g._id};type=product/`} className="text-sm font-semibold">Edit</a></td>
            </tr>
          ))}
          {guides.length === 0 && <tr><td className={`${td} text-mute`} colSpan={7}>No guides yet.</td></tr>}
        </tbody>
      </Table>
    </>
  )
}

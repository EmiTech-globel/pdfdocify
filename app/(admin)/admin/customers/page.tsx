import Link from 'next/link'
import {Search} from 'lucide-react'
import {listCustomers} from '@/lib/admin-data'
import {Pager, PageHead, Table, btnCls, inputCls, ngn, td, th, when} from '@/components/admin/ui'

export const metadata = {title: 'Customers'}

export default async function Customers({searchParams}: {searchParams: Promise<{q?: string; page?: string}>}) {
  const sp = await searchParams
  const q = (sp.q ?? '').slice(0, 80)
  const page = Math.max(1, Math.min(1000, parseInt(sp.page ?? '1', 10) || 1))
  const {rows, total, size} = await listCustomers({q, page})
  const hrefFor = (p: number) => { const s = new URLSearchParams(); if (q) s.set('q', q); if (p > 1) s.set('page', String(p)); return `/admin/customers${s.toString() ? `?${s}` : ''}` }
  return (
    <>
      <PageHead title="Customers" sub={`${total} ${total === 1 ? 'customer' : 'customers'} who have placed an order`} />
      <form className="mb-5 flex flex-wrap items-center gap-3" role="search">
        <div className="relative min-w-0 flex-[1_1_240px]">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input name="q" defaultValue={q} placeholder="Search by email or user ID" aria-label="Search customers" className={`${inputCls} w-full pl-9`} />
        </div>
        <button className={`${btnCls} bg-accent text-white`}>Search</button>
        {q && <Link href="/admin/customers" className="text-sm font-semibold">Clear</Link>}
      </form>
      <Table>
        <thead><tr className="border-b border-line"><th className={th}>Customer</th><th className={th}>Paid orders</th><th className={th}>Total spent</th><th className={th}>Last order</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.clerk_user_id} className="border-b border-line last:border-0 hover:bg-card/60">
              <td className={`${td} max-w-[260px] truncate`}><Link href={`/admin/customers/${r.clerk_user_id}`}>{r.email}</Link></td>
              <td className={td}>{r.orders}</td>
              <td className={`${td} whitespace-nowrap`}>{ngn(Number(r.spent))}</td>
              <td className={`${td} whitespace-nowrap`}>{when(r.last_order)}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className={`${td} text-mute`} colSpan={4}>No customers match.</td></tr>}
        </tbody>
      </Table>
      <Pager page={page} total={total} size={size} hrefFor={hrefFor} />
    </>
  )
}

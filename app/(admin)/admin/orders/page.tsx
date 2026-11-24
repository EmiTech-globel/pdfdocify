import Link from 'next/link'
import {Download, Search} from 'lucide-react'
import {listOrders, normStatus} from '@/lib/admin-data'
import {formatOrderNo} from '@/lib/orders'
import {Pager, PageHead, StatusBadge, Table, btnCls, inputCls, ngn, td, th, when} from '@/components/admin/ui'

export const metadata = {title: 'Orders'}

export default async function Orders({searchParams}: {searchParams: Promise<{status?: string; q?: string; page?: string}>}) {
  const sp = await searchParams
  const status = normStatus(sp.status), q = (sp.q ?? '').slice(0, 80)
  const page = Math.max(1, Math.min(1000, parseInt(sp.page ?? '1', 10) || 1))
  const {rows, total, size} = await listOrders({status, q, page})
  const qs = (p: number) => {
    const s = new URLSearchParams()
    if (status) s.set('status', status)
    if (q) s.set('q', q)
    if (p > 1) s.set('page', String(p))
    return `/admin/orders${s.toString() ? `?${s}` : ''}`
  }
  const exportQs = new URLSearchParams({...(status ? {status} : {}), ...(q ? {q} : {})}).toString()
  return (
    <>
      <PageHead title="Orders" sub={`${total} ${total === 1 ? 'order' : 'orders'}`}>
        <a href={`/admin/orders/export${exportQs ? `?${exportQs}` : ''}`} className={`${btnCls} bg-white text-ink ring-1 ring-line`}><Download size={16} className="mr-2" aria-hidden="true" />Export CSV</a>
      </PageHead>

      <form className="mb-5 flex flex-wrap items-center gap-3" role="search">
        <div className="relative min-w-0 flex-[1_1_240px]">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input name="q" defaultValue={q} placeholder="Search by email or reference" aria-label="Search orders" className={`${inputCls} w-full pl-9`} />
        </div>
        <select name="status" defaultValue={status} aria-label="Status" className={inputCls}>
          <option value="">All statuses</option>
          {['paid', 'pending', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button className={`${btnCls} bg-accent text-white`}>Filter</button>
        {(status || q) && <Link href="/admin/orders" className="text-sm font-semibold">Clear</Link>}
      </form>

      <Table>
        <thead><tr className="border-b border-line"><th className={th}>Date</th><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Items</th><th className={th}>Amount</th><th className={th}>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0 hover:bg-card/60">
              <td className={`${td} whitespace-nowrap`}><Link href={`/admin/orders/${r.id}`}>{when(r.created_at)}</Link></td>
              <td className={`${td} whitespace-nowrap`}><strong>{formatOrderNo(r.order_no)}</strong><div className="font-mono text-xs text-mute">{String(r.reference).slice(4, 14)}</div></td>
              <td className={`${td} max-w-[220px] truncate`}>{r.email}</td>
              <td className={td}>{r.items}</td>
              <td className={`${td} whitespace-nowrap`}>{ngn(Number(r.amount_kobo))}</td>
              <td className={td}><StatusBadge status={r.status} /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className={`${td} text-mute`} colSpan={6}>No orders match.</td></tr>}
        </tbody>
      </Table>
      <Pager page={page} total={total} size={size} hrefFor={qs} />
    </>
  )
}

import Link from 'next/link'
import {overview, pendingReviewCount} from '@/lib/admin-data'
import {PageHead, RevenueChart, Stat, StatusBadge, Table, card, ngn, td, th, when} from '@/components/admin/ui'

export const metadata = {title: 'Overview'}

export default async function AdminHome() {
  const [o, pending] = await Promise.all([overview(), pendingReviewCount()])
  return (
    <>
      <PageHead title="Overview" sub="Paid orders only count toward revenue. Times are in Nigeria time." />
      {pending > 0 && (
        <Link href="/admin/reviews" className="mb-6 flex items-center justify-between gap-3 rounded-[14px] bg-accent px-5 py-4 text-white no-underline hover:text-white">
          <span className="font-semibold">{pending} {pending === 1 ? 'review is' : 'reviews are'} waiting for approval</span>
          <span className="text-sm">Review now</span>
        </Link>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
        <Stat label="Revenue, last 30 days" value={ngn(o.revenue30)} hint={`${o.paid30} paid ${o.paid30 === 1 ? 'order' : 'orders'}`} />
        <Stat label="Revenue, all time" value={ngn(o.revenue)} hint={`${o.paid} paid ${o.paid === 1 ? 'order' : 'orders'}`} />
        <Stat label="Customers" value={String(o.customers)} hint="Have at least one paid order" />
        <Stat label="Pending payments" value={String(o.pending)} hint={`${o.refunded} refunded`} />
      </div>

      <div className={`${card} mt-6`}>
        <h2 className="mb-3 font-heading text-lg font-bold">Revenue, last 30 days</h2>
        <RevenueChart days={o.daily} />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-6">
        <div className={`${card} min-w-0 flex-[1_1_280px]`}>
          <h2 className="mb-3 font-heading text-lg font-bold">Top guides</h2>
          {o.top.length === 0 ? <p className="text-sm text-mute">No sales yet.</p> : (
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {o.top.map((t, i) => (
                <li key={t.slug} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate"><span className="mr-2 text-mute">{i + 1}.</span>{t.title}</span>
                  <span className="shrink-0 font-semibold">{t.units} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="min-w-0 flex-[2_1_420px]">
          <div className="mb-3 flex items-baseline justify-between"><h2 className="font-heading text-lg font-bold">Recent orders</h2><Link href="/admin/orders" className="text-sm font-semibold">View all</Link></div>
          <Table>
            <thead><tr className="border-b border-line"><th className={th}>Date</th><th className={th}>Customer</th><th className={th}>Amount</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {o.recent.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className={td}><Link href={`/admin/orders/${r.id}`}>{when(r.created_at)}</Link></td>
                  <td className={`${td} max-w-[220px] truncate`}>{r.email}</td>
                  <td className={td}>{ngn(Number(r.amount_kobo))}</td>
                  <td className={td}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {o.recent.length === 0 && <tr><td className={`${td} text-mute`} colSpan={4}>No orders yet.</td></tr>}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  )
}

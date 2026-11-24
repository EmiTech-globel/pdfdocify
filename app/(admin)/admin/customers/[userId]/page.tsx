import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getCustomer} from '@/lib/admin-data'
import {q} from '@/lib/sanity'
import {PageHead, StatusBadge, Table, btnCls, card, inputCls, ngn, td, th, when} from '@/components/admin/ui'
import {grantAccess, revokeAccess} from '../../actions'

export const metadata = {title: 'Customer'}

const notices: Record<string, [string, boolean]> = {
  granted: ['Access granted.', false], revoked: ['Access removed.', false], unknown_guide: ['That guide does not exist.', true],
}

export default async function CustomerPage({params, searchParams}: {params: Promise<{userId: string}>; searchParams: Promise<{done?: string; error?: string}>}) {
  const {userId} = await params
  if (!/^[A-Za-z0-9_]{5,80}$/.test(userId)) notFound()
  const sp = await searchParams
  const [c, guides] = await Promise.all([
    getCustomer(userId),
    q<{title: string; slug: string}[]>(`*[_type=="product"]{title,"slug":slug.current}|order(title asc)`),
  ])
  if (!c.orders.length && !c.access.length) notFound()
  const titleOf = (slug: string) => guides.find((g) => g.slug === slug)?.title ?? slug
  const owned = new Set(c.access.map((a) => a.product_slug as string))
  const notice = notices[sp.done ?? sp.error ?? '']
  return (
    <>
      <PageHead title={c.email || 'Customer'} sub={userId}><Link href="/admin/customers" className="text-sm font-semibold">Back to customers</Link></PageHead>
      {notice && <div role={notice[1] ? 'alert' : 'status'} className={`mb-5 rounded-lg px-4 py-3 text-sm ${notice[1] ? 'bg-red-100 text-red-700' : 'bg-accent/10 text-accent'}`}>{notice[0]}</div>}

      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[2_1_420px]">
          <h2 className="mb-3 font-heading text-lg font-bold">Guides they can download</h2>
          <Table>
            <thead><tr className="border-b border-line"><th className={th}>Guide</th><th className={th}>Since</th><th className={th}></th></tr></thead>
            <tbody>
              {c.access.map((a) => (
                <tr key={a.product_slug} className="border-b border-line last:border-0">
                  <td className={td}>{titleOf(a.product_slug)}</td>
                  <td className={`${td} whitespace-nowrap`}>{when(a.granted_at)}</td>
                  <td className={`${td} text-right`}>
                    <form action={revokeAccess}><input type="hidden" name="userId" value={userId} /><input type="hidden" name="slug" value={a.product_slug} /><button className={`${btnCls} bg-white text-[#B3261E] ring-1 ring-line`}>Remove access</button></form>
                  </td>
                </tr>
              ))}
              {c.access.length === 0 && <tr><td className={`${td} text-mute`} colSpan={3}>No access.</td></tr>}
            </tbody>
          </Table>

          <h2 className="mb-3 mt-8 font-heading text-lg font-bold">Orders</h2>
          <Table>
            <thead><tr className="border-b border-line"><th className={th}>Date</th><th className={th}>Amount</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {c.orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className={`${td} whitespace-nowrap`}><Link href={`/admin/orders/${o.id}`}>{when(o.created_at)}</Link></td>
                  <td className={td}>{ngn(Number(o.amount_kobo))}</td>
                  <td className={td}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className={`${card} min-w-0 flex-[1_1_280px]`}>
          <h2 className="mb-1 font-heading text-lg font-bold">Grant access</h2>
          <p className="mb-4 text-sm text-mute">Gives this customer a guide without an order, for example a replacement or a gift. It is recorded in the activity log.</p>
          <form action={grantAccess} className="flex flex-col gap-3">
            <input type="hidden" name="userId" value={userId} />
            <select name="slug" required defaultValue="" aria-label="Guide" className={inputCls}>
              <option value="" disabled>Choose a guide</option>
              {guides.filter((g) => !owned.has(g.slug)).map((g) => <option key={g.slug} value={g.slug}>{g.title}</option>)}
            </select>
            <button className={`${btnCls} bg-accent text-white`}>Grant access</button>
          </form>
        </div>
      </div>
    </>
  )
}

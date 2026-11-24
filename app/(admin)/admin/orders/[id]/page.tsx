import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getOrder} from '@/lib/admin-data'
import {formatOrderNo} from '@/lib/orders'
import {PageHead, StatusBadge, Table, btnCls, card, ngn, td, th, when} from '@/components/admin/ui'
import {grantAccess, refundOrder, revokeAccess} from '../../actions'

export const metadata = {title: 'Order'}

const notices: Record<string, [string, boolean]> = {
  granted: ['Access granted.', false], revoked: ['Access removed.', false], refunded: ['Order marked as refunded and access removed.', false],
  confirm: ['Tick the confirmation box first.', true], state: ['Only paid orders can be refunded.', true],
  paystack: ['Paystack did not accept the refund. Nothing was changed. Check the Paystack dashboard, or the server logs for the reason.', true],
}

export default async function OrderPage({params, searchParams}: {params: Promise<{id: string}>; searchParams: Promise<{done?: string; error?: string}>}) {
  const {id} = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [data, sp] = [await getOrder(id), await searchParams]
  if (!data) notFound()
  const {order, items} = data
  const notice = notices[sp.done ?? sp.error ?? '']
  return (
    <>
      <PageHead title={`Order ${formatOrderNo(order.order_no)}`.trim()} sub={String(order.reference)}>
        <Link href="/admin/orders" className="text-sm font-semibold">Back to orders</Link>
      </PageHead>
      {notice && <div role={notice[1] ? 'alert' : 'status'} className={`mb-5 rounded-lg px-4 py-3 text-sm ${notice[1] ? 'bg-red-100 text-red-700' : 'bg-accent/10 text-accent'}`}>{notice[0]}</div>}

      <div className="flex flex-wrap items-start gap-6">
        <div className={`${card} min-w-0 flex-[1_1_320px]`}>
          <h2 className="mb-4 font-heading text-lg font-bold">Details</h2>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            <dt className="text-mute">Status</dt><dd className="m-0"><StatusBadge status={order.status} /></dd>
            <dt className="text-mute">Amount</dt><dd className="m-0 font-semibold">{ngn(Number(order.amount_kobo))} {order.currency}</dd>
            <dt className="text-mute">Customer</dt><dd className="m-0 break-all"><Link href={`/admin/customers/${order.clerk_user_id}`}>{order.email}</Link></dd>
            <dt className="text-mute">Created</dt><dd className="m-0">{when(order.created_at)}</dd>
            <dt className="text-mute">Paid</dt><dd className="m-0">{when(order.paid_at)}</dd>
            {order.refunded_at && <><dt className="text-mute">Refunded</dt><dd className="m-0">{when(order.refunded_at)}</dd></>}
            <dt className="text-mute">Reference</dt><dd className="m-0 break-all font-mono text-xs">{order.reference}</dd>
          </dl>
        </div>

        <div className="min-w-0 flex-[2_1_420px]">
          <h2 className="mb-3 font-heading text-lg font-bold">Guides in this order</h2>
          <Table>
            <thead><tr className="border-b border-line"><th className={th}>Guide</th><th className={th}>Access</th><th className={th}></th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.product_slug} className="border-b border-line last:border-0">
                  <td className={td}>{i.title}</td>
                  <td className={td}>{i.has_access ? 'Has access' : 'No access'}</td>
                  <td className={`${td} text-right`}>
                    <form action={i.has_access ? revokeAccess : grantAccess} className="inline">
                      <input type="hidden" name="userId" value={order.clerk_user_id} /><input type="hidden" name="slug" value={i.product_slug} /><input type="hidden" name="orderId" value={order.id} />
                      <button className={`${btnCls} ${i.has_access ? 'bg-white text-[#B3261E] ring-1 ring-line' : 'bg-accent text-white'}`}>{i.has_access ? 'Remove access' : 'Grant access'}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {order.status === 'paid' && (
            <div className={`${card} mt-6`}>
              <h2 className="mb-1 font-heading text-lg font-bold">Refund</h2>
              <p className="mb-4 text-sm text-mute">Refunds are full-amount. Access to every guide in this order is removed. Within the 7-day window in your refund policy, check the customer&rsquo;s request first.</p>
              <div className="flex flex-wrap gap-x-8 gap-y-5">
                <form action={refundOrder} className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
                  <input type="hidden" name="id" value={order.id} /><input type="hidden" name="mode" value="paystack" />
                  <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" className="mt-1" />I understand this sends the money back through Paystack and cannot be undone.</label>
                  <button className={`${btnCls} self-start bg-[#B3261E] text-white`}>Refund via Paystack</button>
                </form>
                <form action={refundOrder} className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
                  <input type="hidden" name="id" value={order.id} /><input type="hidden" name="mode" value="record" />
                  <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" className="mt-1" />I already refunded this in the Paystack dashboard. Just record it here.</label>
                  <button className={`${btnCls} self-start bg-white text-ink ring-1 ring-line`}>Record refund only</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

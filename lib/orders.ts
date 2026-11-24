import 'server-only'
import {db} from './db'

export const formatOrderNo = (n: number | string | null | undefined) => (n == null || n === '' ? '' : `TRX-${String(n).padStart(4, '0')}`)

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function ordersForUser(userId: string) {
  const rows = await db()`select o.id, o.order_no, o.amount_kobo, o.status, o.created_at,
      (select count(*)::int from order_items i where i.order_id = o.id) as items,
      (select string_agg(title, ', ' order by title) from order_items i where i.order_id = o.id) as titles
    from orders o where o.clerk_user_id = ${userId} and o.status in ('paid', 'refunded')
    order by o.created_at desc limit 50`
  return rows as any[]
}

export async function orderNoByReference(reference: string) {
  const [row] = await db()`select order_no from orders where reference = ${reference}`
  return formatOrderNo(row?.order_no as string | undefined)
}

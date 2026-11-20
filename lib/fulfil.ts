import 'server-only'
import {db} from './db'
import {verify} from './paystack'
// Idempotent: safe to call from the webhook and the success page, any number of times.
export async function fulfil(reference: string) {
  const sql = db()
  const [order] = await sql`select id, clerk_user_id, amount_kobo, currency, status from orders where reference = ${reference}`
  if (!order) return false
  if (order.status !== 'paid') {
    const tx = await verify(reference)
    if (!tx || tx.status !== 'success' || Number(tx.amount) !== Number(order.amount_kobo) || tx.currency !== order.currency) return false
    await sql`update orders set status = 'paid', paid_at = now() where id = ${order.id} and status = 'pending'`
  }
  await sql`insert into entitlements (clerk_user_id, product_slug, order_id)
    select ${order.clerk_user_id}, product_slug, order_id from order_items where order_id = ${order.id}
    on conflict do nothing`
  return true
}

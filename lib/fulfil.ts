import 'server-only'
import {db} from './db'
import {verify} from './paystack'

export type FulfilResult =
  | {ok: true}
  | {ok: false; reason: 'not_found' | 'refunded' | 'verify_failed' | 'processing' | 'abandoned' | 'failed' | 'mismatch'; status?: string}

// Idempotent: safe to call from the webhook and the success page, any number of times.
// The reason is returned so the success page can explain what happened, and logged so it shows up in Vercel > Logs.
export async function fulfil(reference: string): Promise<FulfilResult> {
  const sql = db()
  const [order] = await sql`select id, clerk_user_id, amount_kobo, currency, status from orders where reference = ${reference}`
  if (!order) { console.error('[fulfil] no order for reference', reference); return {ok: false, reason: 'not_found'} }
  if (order.status === 'refunded') return {ok: false, reason: 'refunded'}
  if (order.status !== 'paid') {
    const tx = await verify(reference)
    if (!tx) { console.error('[fulfil] Paystack verify call failed for', reference); return {ok: false, reason: 'verify_failed'} }
    if (tx.status !== 'success') {
      const processing = ['ongoing', 'pending', 'processing', 'queued'].includes(tx.status)
      return {ok: false, reason: processing ? 'processing' : tx.status === 'abandoned' ? 'abandoned' : 'failed', status: tx.status}
    }
    // If Paystack's fee is passed on to the customer, data.amount is price + fee. data.requested_amount is the price we asked for.
    const requested = tx.requested_amount != null ? Number(tx.requested_amount) : Number(tx.amount)
    if (requested !== Number(order.amount_kobo) || Number(tx.amount) < requested || tx.currency !== order.currency) {
      console.error('[fulfil] amount or currency mismatch', {reference, paystack: {amount: tx.amount, requested: tx.requested_amount, currency: tx.currency}, order: {amount: order.amount_kobo, currency: order.currency}})
      return {ok: false, reason: 'mismatch'}
    }
    await sql`update orders set status = 'paid', paid_at = now() where id = ${order.id} and status = 'pending'`
  }
  await sql`insert into entitlements (clerk_user_id, product_slug, order_id)
    select ${order.clerk_user_id}, product_slug, order_id from order_items where order_id = ${order.id}
    on conflict do nothing`
  return {ok: true}
}

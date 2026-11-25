'use server'
import {auth} from '@clerk/nextjs/server'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {db} from '@/lib/db'
import {isAdmin} from '@/lib/admin'
import {logAdmin} from '@/lib/admin-data'
import {refund} from '@/lib/paystack'
import {fulfil} from '@/lib/fulfil'
import {q} from '@/lib/sanity'

const uuid = /^[0-9a-f-]{36}$/
const slugRe = /^[a-z0-9-]{1,80}$/
const userRe = /^[A-Za-z0-9_]{5,80}$/
const str = (f: FormData, k: string) => String(f.get(k) ?? '')

async function adminId() {
  const {userId} = await auth()
  if (!isAdmin(userId)) throw new Error('forbidden')
  return userId as string
}

export async function grantAccess(formData: FormData) {
  const admin = await adminId()
  const user = str(formData, 'userId'), slug = str(formData, 'slug'), orderId = str(formData, 'orderId')
  if (!userRe.test(user) || !slugRe.test(slug) || (orderId && !uuid.test(orderId))) throw new Error('bad input')
  const exists = await q<{title: string} | null>(`*[_type=="product"&&slug.current==$s][0]{title}`, {s: slug})
  if (!exists) redirect(`/admin/customers/${user}?error=unknown_guide`)
  await db()`insert into entitlements (clerk_user_id, product_slug, order_id) values (${user}, ${slug}, ${orderId || null}) on conflict do nothing`
  await logAdmin(admin, 'grant_access', `${user}:${slug}`, {orderId: orderId || null})
  revalidatePath(`/admin/customers/${user}`)
  if (orderId) revalidatePath(`/admin/orders/${orderId}`)
  redirect(orderId ? `/admin/orders/${orderId}?done=granted` : `/admin/customers/${user}?done=granted`)
}

export async function revokeAccess(formData: FormData) {
  const admin = await adminId()
  const user = str(formData, 'userId'), slug = str(formData, 'slug'), orderId = str(formData, 'orderId')
  if (!userRe.test(user) || !slugRe.test(slug) || (orderId && !uuid.test(orderId))) throw new Error('bad input')
  await db()`delete from entitlements where clerk_user_id = ${user} and product_slug = ${slug}`
  await logAdmin(admin, 'revoke_access', `${user}:${slug}`, {orderId: orderId || null})
  revalidatePath(`/admin/customers/${user}`)
  if (orderId) revalidatePath(`/admin/orders/${orderId}`)
  redirect(orderId ? `/admin/orders/${orderId}?done=revoked` : `/admin/customers/${user}?done=revoked`)
}

// mode "paystack": ask Paystack to refund the money, then record it. mode "record": the refund was already done in the Paystack dashboard.
export async function refundOrder(formData: FormData) {
  const admin = await adminId()
  const id = str(formData, 'id'), mode = str(formData, 'mode')
  if (!uuid.test(id) || !['paystack', 'record'].includes(mode)) throw new Error('bad input')
  if (str(formData, 'confirm') !== 'yes') redirect(`/admin/orders/${id}?error=confirm`)
  const sql = db()
  const [order] = await sql`select reference, status from orders where id = ${id}`
  if (!order || order.status !== 'paid') redirect(`/admin/orders/${id}?error=state`)
  let note = 'recorded'
  if (mode === 'paystack') {
    try { await refund(order.reference as string); note = 'paystack' } catch (e) {
      console.error('[refund]', e instanceof Error ? e.message : e)
      redirect(`/admin/orders/${id}?error=paystack`)
    }
  }
  await sql`update orders set status = 'refunded', refunded_at = now() where id = ${id} and status = 'paid'`
  await sql`delete from entitlements where order_id = ${id}`
  await logAdmin(admin, 'refund_order', `${id}`, {reference: order.reference, mode: note})
  revalidatePath('/admin/orders'); revalidatePath(`/admin/orders/${id}`); revalidatePath('/admin')
  redirect(`/admin/orders/${id}?done=refunded`)
}

// For an order stuck on pending: ask Paystack again. If it was paid, this marks the order paid and grants access.
export async function recheckPayment(formData: FormData) {
  const admin = await adminId()
  const id = str(formData, 'id')
  if (!uuid.test(id)) throw new Error('bad input')
  const [order] = await db()`select reference, status from orders where id = ${id}`
  if (!order) redirect('/admin/orders')
  const result = await fulfil(order.reference as string)
  await logAdmin(admin, 'recheck_payment', id, {reference: order.reference, ok: result.ok, reason: result.ok ? null : result.reason})
  revalidatePath('/admin/orders'); revalidatePath(`/admin/orders/${id}`); revalidatePath('/admin')
  redirect(result.ok ? `/admin/orders/${id}?done=rechecked` : `/admin/orders/${id}?error=recheck&reason=${result.reason}`)
}

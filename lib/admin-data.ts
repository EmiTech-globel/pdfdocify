import 'server-only'
import {db} from './db'

/* eslint-disable @typescript-eslint/no-explicit-any */
const clean = (q: string) => q.replace(/[\\%_]/g, '').trim().slice(0, 80)

export async function logAdmin(adminUserId: string, action: string, target: string, detail: Record<string, unknown> = {}) {
  await db()`insert into admin_log (admin_user_id, action, target, detail) values (${adminUserId}, ${action}, ${target}, ${JSON.stringify(detail)}::jsonb)`
}

export async function pendingReviewCount() {
  const [r] = await db()`select count(*)::int as n from reviews where status = 'pending'`
  return Number(r?.n ?? 0)
}
export async function reviewCounts() {
  const rows = await db()`select status, count(*)::int as n from reviews group by status`
  const out: Record<string, number> = {pending: 0, approved: 0, rejected: 0}
  for (const r of rows) out[r.status as string] = Number(r.n)
  return out
}

export async function overview() {
  const sql = db()
  const [[t], daily, top, recent] = await Promise.all([
    sql`select
        coalesce(sum(amount_kobo) filter (where status = 'paid'), 0)::bigint as revenue,
        coalesce(sum(amount_kobo) filter (where status = 'paid' and paid_at > now() - interval '30 days'), 0)::bigint as revenue30,
        (count(*) filter (where status = 'paid'))::int as paid,
        (count(*) filter (where status = 'paid' and paid_at > now() - interval '30 days'))::int as paid30,
        (count(*) filter (where status = 'pending'))::int as pending,
        (count(*) filter (where status = 'refunded'))::int as refunded,
        (count(distinct clerk_user_id) filter (where status = 'paid'))::int as customers
      from orders`,
    sql`select to_char(d, 'YYYY-MM-DD') as day, coalesce(sum(o.amount_kobo), 0)::bigint as kobo, count(o.id)::int as orders
      from generate_series(current_date - interval '29 days', current_date, interval '1 day') d
      left join orders o on o.status = 'paid' and o.paid_at::date = d::date
      group by d order by d`,
    sql`select oi.product_slug, max(oi.title) as title, count(*)::int as units
      from order_items oi join orders o on o.id = oi.order_id where o.status = 'paid'
      group by oi.product_slug order by units desc limit 5`,
    sql`select id, reference, email, amount_kobo, status, created_at from orders order by created_at desc limit 8`,
  ])
  return {
    revenue: Number(t.revenue), revenue30: Number(t.revenue30), paid: Number(t.paid), paid30: Number(t.paid30),
    pending: Number(t.pending), refunded: Number(t.refunded), customers: Number(t.customers),
    daily: daily.map((d: any) => ({day: d.day as string, kobo: Number(d.kobo), orders: Number(d.orders)})),
    top: top.map((r: any) => ({slug: r.product_slug as string, title: r.title as string, units: Number(r.units)})),
    recent: recent as any[],
  }
}

export type OrderFilter = {status: string; q: string; page: number; size?: number}
const statuses = ['pending', 'paid', 'failed', 'refunded']
export const normStatus = (s?: string) => (s && statuses.includes(s) ? s : '')

export async function listOrders(f: OrderFilter) {
  const size = f.size ?? 20, off = (f.page - 1) * size, q = clean(f.q)
  const rows = await db()`select id, order_no, reference, email, amount_kobo, status, created_at, paid_at, clerk_user_id,
      (select count(*)::int from order_items i where i.order_id = orders.id) as items,
      count(*) over()::int as total
    from orders
    where (${f.status}::text = '' or status = ${f.status})
      and (${q}::text = '' or email ilike '%' || ${q} || '%' or reference ilike '%' || ${q} || '%')
    order by created_at desc limit ${size} offset ${off}`
  return {rows: rows as any[], total: Number(rows[0]?.total ?? 0), size}
}

export async function exportOrders(f: {status: string; q: string}) {
  const q = clean(f.q)
  return (await db()`select o.order_no, o.reference, o.created_at, o.paid_at, o.email, o.status, o.amount_kobo,
      (select string_agg(title, '; ' order by title) from order_items i where i.order_id = o.id) as items
    from orders o
    where (${f.status}::text = '' or o.status = ${f.status})
      and (${q}::text = '' or o.email ilike '%' || ${q} || '%' or o.reference ilike '%' || ${q} || '%')
    order by o.created_at desc limit 5000`) as any[]
}

export async function getOrder(id: string) {
  const sql = db()
  const [order] = await sql`select * from orders where id = ${id}`
  if (!order) return null
  const items = await sql`select i.product_slug, i.title, (e.clerk_user_id is not null) as has_access
    from order_items i left join entitlements e on e.order_id = i.order_id and e.product_slug = i.product_slug
    where i.order_id = ${id} order by i.title`
  return {order: order as any, items: items as any[]}
}

export async function listCustomers(f: {q: string; page: number; size?: number}) {
  const size = f.size ?? 20, off = (f.page - 1) * size, q = clean(f.q)
  const rows = await db()`select clerk_user_id, max(email) as email,
      (count(*) filter (where status = 'paid'))::int as orders,
      coalesce(sum(amount_kobo) filter (where status = 'paid'), 0)::bigint as spent,
      max(created_at) as last_order, count(*) over()::int as total
    from orders group by clerk_user_id
    having (${q}::text = '' or max(email) ilike '%' || ${q} || '%' or clerk_user_id ilike '%' || ${q} || '%')
    order by max(created_at) desc limit ${size} offset ${off}`
  return {rows: rows as any[], total: Number(rows[0]?.total ?? 0), size}
}

export async function getCustomer(userId: string) {
  const sql = db()
  const [orders, access] = await Promise.all([
    sql`select id, reference, email, amount_kobo, status, created_at from orders where clerk_user_id = ${userId} order by created_at desc`,
    sql`select product_slug, order_id, granted_at from entitlements where clerk_user_id = ${userId} order by granted_at desc`,
  ])
  return {orders: orders as any[], access: access as any[], email: (orders[0]?.email as string | undefined) ?? ''}
}

export async function salesBySlug() {
  const rows = await db()`select oi.product_slug, count(*)::int as units from order_items oi join orders o on o.id = oi.order_id where o.status = 'paid' group by oi.product_slug`
  const out: Record<string, number> = {}
  for (const r of rows) out[r.product_slug as string] = Number(r.units)
  return out
}

export async function activity(limit = 100) {
  return (await db()`select id, admin_user_id, action, target, detail, created_at from admin_log order by created_at desc limit ${limit}`) as any[]
}

import {NextResponse} from 'next/server'
import {auth} from '@clerk/nextjs/server'
import {isAdmin} from '@/lib/admin'
import {formatOrderNo} from '@/lib/orders'
import {exportOrders, logAdmin, normStatus} from '@/lib/admin-data'

// A leading = + - @ would be run as a formula by spreadsheet apps, so prefix those cells.
const cell = (v: unknown) => {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  const {userId} = await auth()
  if (!isAdmin(userId)) return new NextResponse('not found', {status: 404})
  const url = new URL(req.url)
  const status = normStatus(url.searchParams.get('status') ?? '')
  const q = (url.searchParams.get('q') ?? '').slice(0, 80)
  const rows = await exportOrders({status, q})
  const head = ['order_no', 'reference', 'created_at', 'paid_at', 'email', 'status', 'amount_ngn', 'items']
  const lines = [head.join(',')].concat(rows.map((r) => [
    formatOrderNo(r.order_no), r.reference, new Date(r.created_at).toISOString(), r.paid_at ? new Date(r.paid_at).toISOString() : '', r.email, r.status, (Number(r.amount_kobo) / 100).toFixed(2), r.items ?? '',
  ].map(cell).join(',')))
  await logAdmin(userId as string, 'export_orders', 'csv', {status, q, rows: rows.length})
  return new NextResponse(lines.join('\r\n'), {headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    'Cache-Control': 'no-store',
  }})
}

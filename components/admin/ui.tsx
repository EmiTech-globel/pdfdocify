import Link from 'next/link'
import {naira} from '@/lib/queries'

export const ngn = (kobo: number) => naira(kobo / 100)
export const when = (d: Date | string | null | undefined) =>
  d ? new Date(d).toLocaleString('en-GB', {timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short'}) : '-'

export const card = 'rounded-[14px] border border-line bg-white p-5 sm:p-6'
export const th = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mute'
export const td = 'px-4 py-3 align-middle'
export const inputCls = 'rounded-lg border border-field bg-white px-3.5 py-2.5 text-sm text-ink'
export const btnCls = 'inline-flex items-center justify-center rounded-lg border-0 px-4 py-2.5 text-sm font-semibold transition hover:brightness-95 disabled:opacity-50'

export function PageHead({title, children, sub}: {title: string; sub?: string; children?: React.ReactNode}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-[28px] font-bold leading-tight sm:text-[32px]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-mute">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  )
}

export function Stat({label, value, hint}: {label: string; value: string; hint?: string}) {
  return (
    <div className={card}>
      <div className="text-sm text-mute">{label}</div>
      <div className="mt-1 font-heading text-[28px] font-bold leading-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-mute">{hint}</div>}
    </div>
  )
}

const badge: Record<string, string> = {
  paid: 'bg-accent/10 text-accent',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-line text-body',
  approved: 'bg-accent/10 text-accent',
  rejected: 'bg-red-100 text-red-700',
}
export function StatusBadge({status}: {status: string}) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badge[status] ?? 'bg-line text-body'}`}>{status}</span>
}

export function Table({children}: {children: React.ReactNode}) {
  return <div className="overflow-x-auto rounded-[14px] border border-line bg-white"><table className="w-full min-w-[640px] border-collapse text-sm">{children}</table></div>
}

export function Pager({page, total, size, hrefFor}: {page: number; total: number; size: number; hrefFor: (p: number) => string}) {
  const pages = Math.max(1, Math.ceil(total / size))
  if (pages <= 1) return null
  const link = 'rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold no-underline'
  return (
    <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-mute">
      <span>Page {page} of {pages} ({total} total)</span>
      <span className="flex gap-2">
        {page > 1 ? <Link href={hrefFor(page - 1)} className={link}>Previous</Link> : <span className={`${link} opacity-40`}>Previous</span>}
        {page < pages ? <Link href={hrefFor(page + 1)} className={link}>Next</Link> : <span className={`${link} opacity-40`}>Next</span>}
      </span>
    </nav>
  )
}

export function RevenueChart({days}: {days: {day: string; kobo: number; orders: number}[]}) {
  const max = Math.max(1, ...days.map((d) => d.kobo))
  const w = 600, h = 140, gap = 4
  const bw = (w - gap * (days.length - 1)) / days.length
  const total = days.reduce((n, d) => n + d.kobo, 0)
  const label = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})
  return (
    <svg viewBox={`0 0 ${w} ${h + 22}`} role="img" aria-label={`Revenue for the last ${days.length} days, total ${ngn(total)}`} className="w-full">
      {days.map((d, i) => {
        const bh = Math.max(d.kobo ? 4 : 2, (d.kobo / max) * h)
        return (
          <rect key={d.day} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx={3} className={d.kobo ? 'fill-accent' : 'fill-line'}>
            <title>{`${label(d.day)}: ${ngn(d.kobo)} (${d.orders} ${d.orders === 1 ? 'order' : 'orders'})`}</title>
          </rect>
        )
      })}
      <text x={0} y={h + 16} className="fill-mute text-[11px]">{label(days[0].day)}</text>
      <text x={w} y={h + 16} textAnchor="end" className="fill-mute text-[11px]">{label(days[days.length - 1].day)}</text>
    </svg>
  )
}

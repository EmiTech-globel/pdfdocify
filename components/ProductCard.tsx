import Link from 'next/link'
import Cover from './Cover'
import AddToCart from './AddToCart'
import Stars from './Stars'
import {naira, type Prod} from '@/lib/queries'

export default function ProductCard({p, rating, className = ''}: {p: Prod; rating?: {avg: number; count: number}; className?: string}) {
  const href = `/guides/${p.slug}`
  return (
    <div className={`flex flex-col gap-3 rounded-[14px] bg-card p-5 ${className}`}>
      <Link href={href} className="block no-underline" aria-label={p.title} tabIndex={-1}>
        <Cover title={p.title} color={p.coverColor} image={p.coverUrl} label="PDF guide" />
      </Link>
      <h3 className="line-clamp-2 font-heading text-[19px] font-bold leading-snug">
        <Link href={href} className="no-underline">{p.title}</Link>
      </h3>
      {!!rating?.count && (
        <Link href={`${href}#reviews`} className="flex items-center gap-1.5 text-xs text-mute no-underline hover:text-accent">
          <Stars value={rating.avg} size={14} />
          <span>{rating.avg.toFixed(1)} ({rating.count})</span>
        </Link>
      )}
      {p.summary && <p className="line-clamp-2 text-sm text-mute">{p.summary}</p>}
      {!!p.pages && <p className="text-sm text-mute">{p.pages} pages</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <strong className="text-xl">{naira(p.price)}</strong>
        <AddToCart line={{type: 'product', slug: p.slug, title: p.title, price: p.price, color: p.coverColor, image: p.coverUrl, meta: `PDF${p.pages ? `, ${p.pages} pages` : ''}`}} />
      </div>
    </div>
  )
}

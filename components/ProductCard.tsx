import Link from 'next/link'
import Cover from './Cover'
import AddToCart from './AddToCart'
import {naira, type Prod} from '@/lib/queries'

export default function ProductCard({p}: {p: Prod}) {
  const meta = [p.summary, p.pages ? `${p.pages} pages` : null].filter(Boolean).join(' / ')
  return (
    <div className="card">
      <Cover title={p.title} color={p.coverColor} image={p.coverUrl} />
      <h3><Link href={`/guides/${p.slug}`} style={{textDecoration: 'none'}}>{p.title}</Link></h3>
      {meta && <p className="mute" style={{margin: 0, fontSize: 14}}>{meta}</p>}
      <div className="row"><strong style={{fontSize: 20}}>{naira(p.price)}</strong>
        <AddToCart line={{type: 'product', slug: p.slug, title: p.title, price: p.price}} /></div>
    </div>
  )
}
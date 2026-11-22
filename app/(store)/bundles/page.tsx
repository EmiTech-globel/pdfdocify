import {q} from '@/lib/sanity'
import {bundlesQ, naira, type Bundle} from '@/lib/queries'
import AddToCart from '@/components/AddToCart'
import Reveal from '@/components/Reveal'
import Cover from '@/components/Cover'
export const metadata = {title: 'Bundles'}
export default async function Bundles() {
  const bundles = await q<Bundle[]>(bundlesQ)
  return (
    <section className="wrap">
      <h1 style={{fontSize: 48, marginBottom: 12}}>Buy together and save</h1>
      <p className="mute" style={{fontSize: 19, marginBottom: 32}}>Each bundle groups guides by goal, so you get the full path for one price.</p>
      <Reveal className="grid">
        {bundles.map((b) => {
          const worth = b.items.reduce((n, p) => n + p.price, 0)
          return (
            <div className="card" key={b._id} style={b.featured ? {outline: '3px solid var(--accent)'} : undefined}>
              <div style={{display: 'flex', gap: 8}}>{b.items.slice(0, 3).map((p) => <div key={p._id} style={{flex: 1}}><Cover title={p.title} color={p.coverColor} image={p.coverUrl} size="sm" /></div>)}</div>
              <h3 style={{fontSize: 24}}>{b.title}</h3>
              <p className="mute" style={{margin: 0}}>{b.summary}</p>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <strong style={{fontSize: 30}}>{naira(b.price)}</strong>
                {worth > b.price && <><s className="mute">{naira(worth)}</s><span style={{color: 'var(--accent)', fontWeight: 600}}>Save {Math.round((1 - b.price / worth) * 100)}%</span></>}
              </div>
              <AddToCart label="Add bundle to cart" line={{type: 'bundle', slug: b.slug, title: b.title, price: b.price}} />
            </div>
          )
        })}
      </Reveal>
    </section>
  )
}
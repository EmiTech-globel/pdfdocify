import Link from 'next/link'
import {q} from '@/lib/sanity'
import {settingsQ, productsQ, bundlesQ, naira, type Settings, type Prod, type Bundle} from '@/lib/queries'
import ProductCard from '@/components/ProductCard'
import Reveal from '@/components/Reveal'
import HeroScene from '@/components/HeroScene'
import HeroIntro from '@/components/HeroIntro'
import AddToCart from '@/components/AddToCart'
export default async function Home() {
  const [s, products, bundles] = await Promise.all([q<Settings>(settingsQ), q<Prod[]>(productsQ), q<Bundle[]>(bundlesQ)])
  const feat = bundles.find((b) => b.featured)
  const worth = feat ? feat.items.reduce((n, p) => n + p.price, 0) : 0
  return (
    <>
      <section className="wrap hero">
        <HeroIntro>
          <span data-intro className="eyebrow">{s?.tagline}</span>
          <h1 data-intro>{s?.heroTitle}</h1>
          <p data-intro className="mute" style={{fontSize: 19, maxWidth: 520}}>{s?.heroSubtitle}</p>
          <div data-intro><Link href="#guides" className="btn">Browse all guides</Link></div>
        </HeroIntro>
        <HeroScene title={products[0]?.title ?? s?.name ?? 'Your guide'} color={products[0]?.coverColor} />
      </section>
      {!!s?.trust?.length && <div className="strip"><div className="wrap row">{s.trust.map((t) => <span key={t}>{t}</span>)}</div></div>}
      <section id="guides" className="wrap">
        <h2 style={{fontSize: 38, marginBottom: 28}}>All guides</h2>
        <Reveal className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</Reveal>
      </section>
      {feat && (
        <section className="wrap">
          <div className="panel row" style={{background: 'var(--accent)', color: '#fff', padding: 40}}>
            <div style={{flex: '1 1 380px'}}>
              <h2 style={{fontSize: 32, marginBottom: 8}}>{feat.title}</h2>
              <p style={{margin: 0}}>{feat.summary} {worth > feat.price && `Save ${Math.round((1 - feat.price / worth) * 100)}%.`}</p>
            </div>
            <AddToCart label={`Add bundle for ${naira(feat.price)}`} line={{type: 'bundle', slug: feat.slug, title: feat.title, price: feat.price}} />
          </div>
        </section>
      )}
    </>
  )
}

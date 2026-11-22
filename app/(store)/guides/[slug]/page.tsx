import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import { q } from '@/lib/sanity'
import { productQ, productsQ, naira, type ProdFull, type Prod } from '@/lib/queries'
import Cover from '@/components/Cover'
import AddToCart from '@/components/AddToCart'
import ProductCard from '@/components/ProductCard'
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await q<ProdFull | null>(productQ, { slug: (await params).slug })
  return { title: p?.title, description: p?.summary }
}
export default async function Guide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [p, all] = await Promise.all([q<ProdFull | null>(productQ, { slug }), q<Prod[]>(productsQ)])
  if (!p) notFound()
  return (
    <>
      <section className="wrap split">
        <div className="cover-lg"><Cover title={p.title} color={p.coverColor} image={p.coverUrl} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="mute">{p.category}{p.version ? ` / Version ${p.version}` : ''}</span>
          <h1 style={{ fontSize: 44 }}>{p.title}</h1>
          <p className="mute" style={{ fontSize: 18, margin: 0 }}>{p.summary}</p>
          <strong style={{ fontSize: 36 }}>{naira(p.price)}</strong>
          <div><AddToCart line={{ type: 'product', slug: p.slug, title: p.title, price: p.price }} /></div>
          {p.pages && <span className="mute">PDF, {p.pages} pages. Instant download after payment.</span>}
        </div>
      </section>
      <section className="wrap split">
        <div className="prose">
          {!!p.body?.length && <PortableText value={p.body} />}
          {!!p.chapters?.length && (<><h2 style={{ fontSize: 28, margin: '24px 0 8px' }}>What is inside</h2>
            {p.chapters.map((c) => <div className="line" key={c.title}><div><strong>{c.title}</strong><div className="mute">{c.blurb}</div></div></div>)}</>)}
        </div>
        {!!p.faq?.length && <div><h2 style={{ fontSize: 28, marginBottom: 8 }}>Questions</h2>
          {p.faq.map((f) => <div className="line" key={f.q}><div><strong>{f.q}</strong><div className="mute">{f.a}</div></div></div>)}</div>}
      </section>
      <section className="wrap"><h2 style={{ fontSize: 28, marginBottom: 24 }}>You may also like</h2>
        <div className="grid">{all.filter((x) => x.slug !== slug).slice(0, 3).map((x) => <ProductCard key={x._id} p={x} />)}</div></section>
    </>
  )
}

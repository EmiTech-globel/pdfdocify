import Link from 'next/link'
import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'
import {q} from '@/lib/sanity'
import {productQ, productsQ, naira, type ProdFull, type Prod} from '@/lib/queries'
import Cover from '@/components/Cover'
import AddToCart from '@/components/AddToCart'
import ProductCard from '@/components/ProductCard'
import {bodyComponents} from '@/components/prose'
import {wrap} from '@/lib/ui'

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const p = await q<ProdFull | null>(productQ, {slug: (await params).slug})
  return {title: p?.title, description: p?.summary}
}

export default async function Guide({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const [p, all] = await Promise.all([q<ProdFull | null>(productQ, {slug}), q<Prod[]>(productsQ)])
  if (!p) notFound()
  const related = all.filter((x) => x.slug !== slug)
  const sameCategory = related.filter((x) => x.category && x.category === p.category)
  const more = [...sameCategory, ...related.filter((x) => !sameCategory.includes(x))].slice(0, 3)
  const facts = [`PDF${p.pages ? `, ${p.pages} pages` : ''}${p.fileSizeMb ? `, ${p.fileSizeMb} MB` : ''}`, 'Instant download', 'Works on any device', 'Free updates']
  return (
    <>
      <nav aria-label="Breadcrumb" className={`${wrap} pb-2 pt-7 text-sm text-mute`}>
        <Link href="/" className="text-mute underline">Shop</Link>
        {p.category && <> / <Link href="/#guides" className="text-mute underline">{p.category}</Link></>} / {p.title}
      </nav>

      <section className={`${wrap} flex flex-wrap gap-x-14 gap-y-10 pb-14 pt-6`}>
        <div className="flex flex-[1_1_380px] flex-col items-center gap-4">
          <Cover size="lg" title={p.title} color={p.coverColor} image={p.coverUrl} className="shadow-[0_40px_80px_rgba(107,99,201,0.26)]" />
        </div>
        <div className="flex flex-[1_1_440px] flex-col gap-5">
          <div className="text-sm text-mute">{[p.category, p.version ? `Version ${p.version}` : null].filter(Boolean).join(' / ')}</div>
          <h1 className="font-heading text-[clamp(30px,5vw,44px)] font-bold leading-[1.08] tracking-[-0.02em]">{p.headline || p.title}</h1>
          {p.summary && <p className="text-lg text-body">{p.summary}</p>}
          {p.author && <div className="text-sm text-mute">By {p.author}</div>}
          <div className="font-heading text-[40px] font-bold">{naira(p.price)}</div>
          <div className="flex flex-wrap gap-3.5">
            <AddToCart variant="md" line={{type: 'product', slug: p.slug, title: p.title, price: p.price, color: p.coverColor, image: p.coverUrl, meta: `PDF${p.pages ? `, ${p.pages} pages` : ''}`}} />
          </div>
          <div className="grid grid-cols-2 gap-2.5 border-t border-line pt-3 text-sm text-body">
            {facts.map((f) => <div key={f}>{f}</div>)}
          </div>
        </div>
      </section>

      {(!!p.chapters?.length || !!p.faq?.length || !!p.body?.length) && (
        <section className={`${wrap} flex flex-wrap gap-12 pb-14 pt-4`}>
          <div className="flex-[2_1_460px]">
            {!!p.body?.length && (
              <div className="mb-10">
                <h2 className="mb-5 font-heading text-[30px] font-bold">About this guide</h2>
                <PortableText value={p.body} components={bodyComponents} />
              </div>
            )}
            {!!p.chapters?.length && (
              <>
                <h2 className="mb-5 font-heading text-[30px] font-bold">What is inside</h2>
                <div className="rounded-[14px] bg-card px-5 py-2 sm:px-7">
                  {p.chapters.map((c) => (
                    <div key={c.title} className="border-b border-line py-[18px] last:border-0">
                      <strong>{c.title}</strong>
                      {c.blurb && <div className="text-[15px] text-mute">{c.blurb}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {!!p.faq?.length && (
            <div className="flex-[1_1_300px]">
              <h2 className="mb-5 font-heading text-[30px] font-bold">Questions</h2>
              {p.faq.map((f) => (
                <div key={f.q} className="border-t border-line py-4 last:border-b">
                  <strong>{f.q}</strong>
                  <div className="text-[15px] text-body">{f.a}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!!more.length && (
        <section className={`${wrap} pb-6 pt-2`}>
          <h2 className="mb-6 font-heading text-[30px] font-bold">You may also like</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-6">
            {more.map((x) => <ProductCard key={x._id} p={x} />)}
          </div>
        </section>
      )}
    </>
  )
}

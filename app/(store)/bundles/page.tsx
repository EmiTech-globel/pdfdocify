import Link from 'next/link'
import {q} from '@/lib/sanity'
import {bundlesQ, naira, type Bundle} from '@/lib/queries'
import AddToCart from '@/components/AddToCart'
import Reveal from '@/components/Reveal'
import Cover from '@/components/Cover'
import {btnWhite, eyebrow, wrap} from '@/lib/ui'

export const metadata = {title: 'Bundles'}

export default async function Bundles() {
  const bundles = await q<Bundle[]>(bundlesQ)
  return (
    <>
      <section className={`${wrap} pb-6 pt-10 sm:pt-16`}>
        <div className={`${eyebrow} mb-3`}>Bundles</div>
        <h1 className="mb-3 font-heading text-[clamp(34px,5vw,52px)] font-bold leading-[1.05] tracking-[-0.025em]">Buy together and save</h1>
        <p className="max-w-[560px] text-[19px] text-body">Each bundle groups guides by goal, so you get the full path for one price.</p>
      </section>

      <Reveal className={`${wrap} grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6 pb-10 pt-8`}>
        {bundles.map((b) => {
          const items = b.items ?? []
          const worth = items.reduce((n, p) => n + p.price, 0)
          const pages = items.reduce((n, p) => n + (p.pages ?? 0), 0)
          const save = worth > b.price ? Math.round((1 - b.price / worth) * 100) : 0
          const first = items[0]
          return (
            <div key={b._id} className={`flex flex-col gap-4 rounded-[14px] bg-card p-6 sm:p-7 ${b.featured ? 'outline-3 outline-accent' : ''}`}>
              <div className="flex gap-2.5">
                {items.slice(0, 3).map((p) => <Cover key={p._id} size="mini" title={p.title} color={p.coverColor} image={p.coverUrl} />)}
              </div>
              {save > 0 && <div className="text-[13px] font-semibold text-accent">Save {save}%</div>}
              <h3 className="font-heading text-2xl font-bold">{b.title}</h3>
              {b.summary && <p className="text-[15px] text-body">{b.summary}</p>}
              <div className="flex flex-col gap-1.5 text-sm text-body">
                <div>{items.length} PDF guides{pages ? `, ${pages} pages total` : ''}</div>
                <div>Free updates</div>
              </div>
              <div className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <strong className="font-heading text-[32px] font-bold">{naira(b.price)}</strong>
                {worth > b.price && <s className="text-mute">{naira(worth)}</s>}
              </div>
              <AddToCart variant="block" label="Add bundle to cart" line={{type: 'bundle', slug: b.slug, title: b.title, price: b.price, color: first?.coverColor, image: first?.coverUrl, meta: `Bundle, ${items.length} guides`}} />
            </div>
          )
        })}
      </Reveal>

      <section className={`${wrap} pb-6 pt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-accent px-6 py-7 text-white sm:px-8">
          <div>
            <strong className="text-lg">Not sure which bundle fits?</strong>
            <div className="text-[15px] text-accent-soft">Browse single guides, or contact us and we will point you to the right one.</div>
          </div>
          <Link href="/#guides" className={btnWhite}>Browse single guides</Link>
        </div>
      </section>
    </>
  )
}

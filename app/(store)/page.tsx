import Link from 'next/link'
import {q} from '@/lib/sanity'
import {settingsQ, productsQ, bundlesQ, naira, type Settings, type Prod, type Bundle} from '@/lib/queries'
import ProductGrid from '@/components/ProductGrid'
import HeroScene from '@/components/HeroScene'
import HeroIntro from '@/components/HeroIntro'
import {btnPrimary, eyebrow, wrap} from '@/lib/ui'

export default async function Home() {
  const [s, products, bundles] = await Promise.all([q<Settings>(settingsQ), q<Prod[]>(productsQ), q<Bundle[]>(bundlesQ)])
  const hero = products.find((p) => p.coverUrl) ?? products[0]
  const feat = bundles.find((b) => b.featured)
  const worth = feat ? feat.items.reduce((n, p) => n + p.price, 0) : 0
  const save = feat && worth > feat.price ? Math.round((1 - feat.price / worth) * 100) : 0
  return (
    <>
      <section className={`${wrap} flex flex-wrap items-center gap-12 pb-14 pt-12 sm:pt-[72px]`}>
        <HeroIntro className="flex flex-[1_1_480px] flex-col gap-5">
          <span data-intro className={eyebrow}>{s?.tagline}</span>
          <h1 data-intro className="font-heading text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">{s?.heroTitle}</h1>
          <p data-intro className="max-w-[520px] text-[19px] text-body">{s?.heroSubtitle}</p>
          <div data-intro className="flex flex-wrap items-center gap-4">
            <Link href="#guides" className={btnPrimary}>Browse all guides</Link>
            <Link href="/bundles" className="px-2 py-[15px] font-semibold">See bundles</Link>
          </div>
        </HeroIntro>
        <HeroScene title={hero?.title ?? s?.name ?? 'Your guide'} color={hero?.coverColor} image={hero?.coverUrl} />
      </section>

      {!!s?.trust?.length && (
        <div className="bg-accent text-white">
          <div className={`${wrap} flex flex-wrap justify-between gap-x-10 gap-y-3 py-6 text-[15px]`}>
            {s.trust.map((t) => <div key={t}>{t}</div>)}
          </div>
        </div>
      )}

      <section id="guides" className={`${wrap} pb-6 pt-14 sm:pt-[72px]`}>
        <ProductGrid products={products} />
      </section>

      {feat && (
        <section className={`${wrap} py-12`}>
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-accent p-8 text-white sm:p-12">
            <div className="flex-[1_1_380px]">
              <h2 className="mb-2 font-heading text-[28px] font-bold leading-[1.1] sm:text-[34px]">{feat.title}</h2>
              <p className="text-[17px]">{feat.summary}{save > 0 && ` Save ${save}%.`}</p>
            </div>
            <Link href="/bundles" className="inline-flex items-center justify-center rounded-[10px] bg-white px-7 py-[15px] font-semibold text-ink no-underline transition hover:text-ink hover:brightness-95">
              Get the bundle for {naira(feat.price)}
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

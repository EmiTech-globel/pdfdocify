import Link from 'next/link'
import {q} from '@/lib/sanity'
import {settingsQ, productsQ, bundlesQ, naira, type Settings, type Prod, type Bundle} from '@/lib/queries'
import ProductCard from '@/components/ProductCard'
import Reveal from '@/components/Reveal'
import {ChevronRight} from 'lucide-react'
import {ratingsBySlug} from '@/lib/reviews'
import HeroScene from '@/components/HeroScene'
import HeroIntro from '@/components/HeroIntro'
import {btnPrimary, eyebrow, wrap} from '@/lib/ui'

export default async function Home() {
  const [s, products, bundles] = await Promise.all([q<Settings>(settingsQ), q<Prod[]>(productsQ), q<Bundle[]>(bundlesQ)])
  const ratings = await ratingsBySlug().catch(() => ({} as Record<string, {avg: number; count: number}>))
  const hero = products.find((p) => p.coverUrl) ?? products[0]
  const feat = bundles.find((b) => b.featured)
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[]
  const latest = products.slice(0, 8)
  const worth = feat ? feat.items.reduce((n, p) => n + p.price, 0) : 0
  const save = feat && worth > feat.price ? Math.round((1 - feat.price / worth) * 100) : 0
  return (
    <>
      <section className={`${wrap} flex flex-wrap items-center gap-12 pb-14 pt-12 sm:pt-[72px]`}>
        <HeroIntro className="flex min-w-0 flex-[1_1_480px] flex-col gap-5">
          <span data-intro className={eyebrow}>{s?.tagline}</span>
          <h1 data-intro className="font-heading text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.025em]">{s?.heroTitle}</h1>
          <p data-intro className="max-w-[520px] text-[19px] text-body">{s?.heroSubtitle}</p>
          <div data-intro className="flex flex-wrap items-center gap-4">
            <Link href="/guides" className={btnPrimary}>Browse all guides</Link>
            <Link href="/bundles" className="px-2 py-[15px] font-semibold">See bundles</Link>
          </div>
        </HeroIntro>
        <HeroScene title={hero?.title ?? s?.name ?? 'Your guide'} color={hero?.coverColor} image={hero?.coverUrl} />
      </section>

      {!!s?.trust?.length && (
        <div className="bg-accent text-white">
          <Reveal className={`${wrap} flex flex-wrap justify-between gap-x-10 gap-y-3 py-6 text-[15px]`} y={10}>
            {s.trust.map((t) => <div key={t}>{t}</div>)}
          </Reveal>
        </div>
      )}

      <section id="guides" className={`${wrap} pb-6 pt-14 sm:pt-[72px]`}>
        <div className={`flex items-end justify-between gap-4 ${categories.length > 1 ? 'mb-5' : 'mb-8'}`}>
          <h2 className="font-heading text-[32px] font-bold tracking-[-0.02em] sm:text-[38px]">All guides</h2>
          <Link href="/guides" className="inline-flex items-center gap-1 whitespace-nowrap pb-1.5 font-semibold no-underline">
            View all<ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {categories.length > 1 && (
          <nav aria-label="Browse by category" className="mb-8 flex flex-wrap gap-2.5 text-sm font-medium">
            <Link href="/guides" className="rounded-full bg-accent px-4 py-2 text-white no-underline hover:text-white">All</Link>
            {categories.map((c) => (
              <Link key={c} href={`/guides?category=${encodeURIComponent(c)}`} className="rounded-full bg-card px-4 py-2 text-ink no-underline hover:bg-line hover:text-ink">{c}</Link>
            ))}
          </nav>
        )}
        <Reveal className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-6">
          {latest.map((p) => <ProductCard key={p._id} p={p} rating={ratings[p.slug]} />)}
        </Reveal>
        {products.length > latest.length && (
          <div className="mt-8 flex justify-center">
            <Link href="/guides" className={btnPrimary}>View all {products.length} guides</Link>
          </div>
        )}
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

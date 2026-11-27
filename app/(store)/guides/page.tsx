import Link from 'next/link'
import {q} from '@/lib/sanity'
import {P, categoriesQ, type Cat, type Prod} from '@/lib/queries'
import ProductCard from '@/components/ProductCard'
import GuideFilters from '@/components/GuideFilters'
import Reveal from '@/components/Reveal'
import {ratingsBySlug} from '@/lib/reviews'
import {btnPrimary, eyebrow, wrap} from '@/lib/ui'

export const metadata = {title: 'All guides'}

const PER_PAGE = 12
const orders: Record<string, string> = {
  featured: 'coalesce(sort,999) asc,_createdAt desc',
  new: '_createdAt desc',
  'price-asc': 'price asc',
  'price-desc': 'price desc',
  title: 'title asc',
}

type SP = {q?: string; category?: string; sort?: string; page?: string}

function href(p: {q?: string; category?: string; sort?: string; page?: number}) {
  const s = new URLSearchParams()
  if (p.q) s.set('q', p.q)
  if (p.category) s.set('category', p.category)
  if (p.sort && p.sort !== 'featured') s.set('sort', p.sort)
  if (p.page && p.page > 1) s.set('page', String(p.page))
  const qs = s.toString()
  return `/guides${qs ? `?${qs}` : ''}`
}

export default async function Guides({searchParams}: {searchParams: Promise<SP>}) {
  const sp = await searchParams
  const term = (sp.q ?? '').trim().slice(0, 80)
  const words = term.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, '')).filter(Boolean).slice(0, 6)
  const sort = sp.sort && sp.sort in orders ? sp.sort : 'featured'
  const page = Math.max(1, Math.min(500, parseInt(sp.page ?? '1', 10) || 1))

  const categories = (await q<Cat[]>(categoriesQ).catch(() => [] as Cat[])).filter((c) => c.count > 0)
  const selected = categories.find((c) => c.slug === sp.category)
  const category = selected?.slug ?? ''

  const conds = ['_type=="product"', 'active==true']
  if (category) conds.push('category->slug.current==$category')
  if (words.length) conds.push('(title match $m||summary match $m||author match $m||category->title match $m)')
  const filter = conds.join('&&')
  const from = (page - 1) * PER_PAGE
  const {items, total} = await q<{items: Prod[]; total: number}>(
    `{"items":*[${filter}]|order(${orders[sort]})[$from...$to]{${P}},"total":count(*[${filter}])}`,
    {from, to: from + PER_PAGE, ...(category ? {category} : {}), ...(words.length ? {m: words.map((w) => `${w}*`)} : {})},
  )
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))
  const ratings = await ratingsBySlug().catch(() => ({} as Record<string, {avg: number; count: number}>))
  const state = {q: term, category, sort}
  const pill = (active: boolean) => `rounded-full px-4 py-2 text-sm font-medium no-underline transition ${active ? 'bg-accent text-white hover:text-white' : 'bg-card text-ink hover:bg-line hover:text-ink'}`

  return (
    <>
      <section className={`${wrap} pb-6 pt-10 sm:pt-16`}>
        <div className={`${eyebrow} mb-3`}>Shop</div>
        <h1 className="mb-6 font-heading text-[clamp(34px,5vw,52px)] font-bold leading-[1.05] tracking-[-0.025em]">{selected ? selected.title : 'All guides'}</h1>
        {selected?.description && <p className="-mt-3 mb-6 max-w-[620px] text-body">{selected.description}</p>}
        <GuideFilters q={term} category={category} sort={sort} />
        {categories.length > 1 && (
          <nav aria-label="Categories" className="-mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <Link href={href({...state, category: ''})} className={`${pill(!category)} shrink-0 whitespace-nowrap`} aria-current={!category ? 'true' : undefined}>All</Link>
            {categories.map((c) => (
              <Link key={c.slug} href={href({...state, category: c.slug})} className={`${pill(category === c.slug)} shrink-0 whitespace-nowrap`} aria-current={category === c.slug ? 'true' : undefined}>
                {c.title} <span className="opacity-70">{c.count}</span>
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section className={`${wrap} pb-14 pt-4`}>
        <p className="mb-5 text-sm text-mute" aria-live="polite">
          {total === 0 ? 'No guides found' : `${total} ${total === 1 ? 'guide' : 'guides'}`}
          {term && <> for &ldquo;{term}&rdquo;</>}{selected && <> in {selected.title}</>}{(term || selected) && <> / <Link href="/guides" className="font-semibold underline">Clear filters</Link></>}
        </p>
        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-5 rounded-[14px] bg-card p-7">
            <p className="text-body">Nothing matches your search. Try different words or clear the filters.</p>
            <Link href="/guides" className={btnPrimary}>Clear filters</Link>
          </div>
        ) : (
          <Reveal key={`${term}|${category}|${sort}|${page}`} className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-6">
            {items.map((p) => <ProductCard key={p._id} p={p} rating={ratings[p.slug]} />)}
          </Reveal>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm">
            {page > 1 ? <Link href={href({...state, page: page - 1})} className="rounded-lg bg-card px-4 py-2.5 font-semibold no-underline">Previous</Link> : <span className="px-4 py-2.5 text-mute">Previous</span>}
            <span className="text-mute">Page {page} of {pages}</span>
            {page < pages ? <Link href={href({...state, page: page + 1})} className="rounded-lg bg-card px-4 py-2.5 font-semibold no-underline">Next</Link> : <span className="px-4 py-2.5 text-mute">Next</span>}
          </nav>
        )}
      </section>
    </>
  )
}

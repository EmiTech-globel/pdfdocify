'use client'
import {useEffect, useRef, useState, useTransition} from 'react'
import {useRouter} from 'next/navigation'
import {Search} from 'lucide-react'

const sorts = [['featured', 'Featured'], ['new', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['title', 'Title A to Z']]

// Works without JavaScript (plain GET form) and updates results as you type when JavaScript is on.
export default function GuideFilters({q, category, sort}: {q: string; category: string; sort: string}) {
  const router = useRouter()
  const [value, setValue] = useState(q)
  const [pending, start] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => setValue(q), [q])
  useEffect(() => () => clearTimeout(timer.current), [])

  function go(next: {q?: string; sort?: string}) {
    const p = new URLSearchParams()
    const nq = (next.q ?? value).trim()
    const ns = next.sort ?? sort
    if (nq) p.set('q', nq)
    if (category) p.set('category', category)
    if (ns && ns !== 'featured') p.set('sort', ns)
    const qs = p.toString()
    start(() => router.replace(`/guides${qs ? `?${qs}` : ''}`, {scroll: false}))
  }

  return (
    <form role="search" action="/guides" className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); clearTimeout(timer.current); go({}) }}>
      <div className="relative min-w-0 flex-[1_1_260px]">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
        <input
          type="search"
          name="q"
          value={value}
          placeholder="Search guides"
          aria-label="Search guides"
          maxLength={80}
          onChange={(e) => {
            const v = e.target.value
            setValue(v)
            clearTimeout(timer.current)
            timer.current = setTimeout(() => go({q: v}), 350)
          }}
          className="w-full rounded-lg border border-field bg-white py-3 pl-10 pr-3.5 text-ink"
        />
      </div>
      {category && <input type="hidden" name="category" value={category} />}
      <label className="flex items-center gap-2 text-sm font-semibold">
        <span className="sr-only sm:not-sr-only">Sort</span>
        <select
          name="sort"
          value={sort}
          onChange={(e) => go({sort: e.target.value})}
          className="rounded-lg border border-field bg-white px-3 py-3 font-normal text-ink"
        >
          {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <button type="submit" className="rounded-lg border-0 bg-accent px-5 py-3 font-semibold text-white transition hover:brightness-110 sm:hidden">Search</button>
      <span className="text-sm text-mute" aria-live="polite">{pending ? 'Updating...' : ''}</span>
    </form>
  )
}

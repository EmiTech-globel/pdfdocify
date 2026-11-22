'use client'
import {useMemo, useState} from 'react'
import ProductCard from './ProductCard'
import type {Prod} from '@/lib/queries'

export default function ProductGrid({products, title = 'All guides'}: {products: Prod[]; title?: string}) {
  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))] as string[], [products])
  const [active, setActive] = useState('All')
  const shown = active === 'All' ? products : products.filter((p) => p.category === active)
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-heading text-[32px] font-bold tracking-[-0.02em] sm:text-[38px]">{title}</h2>
        {categories.length > 1 && (
          <div role="group" aria-label="Filter guides by category" className="flex flex-wrap gap-2.5 text-sm font-medium">
            {['All', ...categories].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={active === c}
                onClick={() => setActive(c)}
                className={`rounded-full border-0 px-4 py-2 transition ${active === c ? 'bg-accent text-white' : 'bg-card text-ink hover:bg-line'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-6">
        {shown.map((p) => <ProductCard key={p._id} p={p} className="motion-safe:animate-[rise_.5s_ease-out_both]" />)}
      </div>
    </>
  )
}

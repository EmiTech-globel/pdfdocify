'use client'
import {useEffect, useState} from 'react'
import {Check} from 'lucide-react'
import {useCart, type Line} from '@/store/cart'

const variants = {
  sm: 'rounded-lg px-4 py-2.5 text-sm',
  md: 'rounded-[10px] px-[30px] py-[15px] text-[17px]',
  block: 'w-full rounded-[10px] p-3.5',
}

export default function AddToCart({line, label = 'Add to cart', variant = 'sm'}: {line: Line; label?: string; variant?: keyof typeof variants}) {
  const add = useCart((s) => s.add)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 2000)
    return () => clearTimeout(t)
  }, [done])
  return (
    <button
      type="button"
      onClick={() => { add(line); setDone(true) }}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap border-0 bg-accent font-semibold text-white transition hover:brightness-110 ${variants[variant]}`}
    >
      {done ? <><Check size={16} aria-hidden="true" />Added</> : label}
    </button>
  )
}

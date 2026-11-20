'use client'
import {useState} from 'react'
import {useCart, type Line} from '@/store/cart'
export default function AddToCart({line, label = 'Add to cart'}: {line: Line; label?: string}) {
  const add = useCart((s) => s.add)
  const [done, setDone] = useState(false)
  return (
    <button className="btn sm" onClick={() => { add(line); setDone(true) }}>
      {done ? 'Added to cart' : label}
    </button>
  )
}

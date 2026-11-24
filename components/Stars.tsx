import {Star} from 'lucide-react'

export default function Stars({value, size = 16, className = ''}: {value: number; size?: number; className?: string}) {
  const filled = Math.round(value)
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} aria-hidden="true" className={i <= filled ? 'fill-star text-star' : 'fill-transparent text-star/40'} />
      ))}
    </span>
  )
}

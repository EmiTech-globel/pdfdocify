import Image from 'next/image'

export type CoverSize = 'card' | 'lg' | 'mini' | 'thumb' | 'lib'

const box: Record<CoverSize, string> = {
  card: 'w-full h-[220px]',
  lg: 'w-[340px] max-w-full aspect-[340/460]',
  mini: 'w-[90px] h-[124px] shrink-0',
  thumb: 'w-[72px] h-[96px] shrink-0',
  lib: 'w-[84px] h-[112px] shrink-0',
}
const imageBox: Record<CoverSize, string> = {...box, card: 'w-full aspect-[3/4]'}
const pad: Record<CoverSize, string> = {card: 'p-5', lg: 'p-5', mini: 'p-3.5', thumb: 'p-2', lib: 'p-2.5'}
const titleSize: Record<CoverSize, string> = {card: 'text-[22px]', lg: 'text-[22px]', mini: 'text-[13px]', thumb: 'text-[10px]', lib: 'text-[12px]'}
const sizes: Record<CoverSize, string> = {card: '(max-width: 600px) 100vw, 320px', lg: '340px', mini: '90px', thumb: '72px', lib: '84px'}

export default function Cover({title, color, image, size = 'card', label = 'PDF guide', className = ''}: {
  title: string; color?: string; image?: string; size?: CoverSize; label?: string; className?: string
}) {
  if (image) {
    return (
      <div className={`relative overflow-hidden rounded-md ${imageBox[size]} ${className}`}>
        <Image src={image} alt={title} fill sizes={sizes[size]} className="object-cover" />
      </div>
    )
  }
  const small = size === 'thumb' || size === 'lib'
  return (
    <div
      className={`flex flex-col ${small ? 'justify-end' : 'justify-between'} overflow-hidden rounded-md text-white ${box[size]} ${pad[size]} ${className}`}
      style={{background: color || '#6B63C9'}}
    >
      {!small && <div className={`uppercase tracking-[0.14em] opacity-70 ${size === 'mini' ? 'text-[10px]' : 'text-[11px]'}`}>{label}</div>}
      <div className={`line-clamp-4 break-words font-heading font-bold leading-[1.1] ${titleSize[size]}`}>{title}</div>
      {(size === 'card' || size === 'lg') && <div className="h-[5px] w-11 bg-card opacity-85" />}
    </div>
  )
}

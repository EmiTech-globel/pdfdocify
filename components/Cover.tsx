import Image from 'next/image'
export default function Cover({title, color, image, size = 'md'}: {title: string; color?: string; image?: string; size?: 'sm' | 'md'}) {
  if (image) {
    return (
      <div style={{position: 'relative', aspectRatio: '3 / 4', borderRadius: size === 'sm' ? 4 : 6, overflow: 'hidden'}}>
        <Image src={image} alt={title} fill sizes={size === 'sm' ? '120px' : '(max-width: 600px) 100vw, 340px'} style={{objectFit: 'cover'}} />
      </div>
    )
  }
  return (
    <div className={`cover${size === 'sm' ? ' sm' : ''}`} style={{background: color || '#6B63C9'}}>
      <small style={{opacity: 0.7, fontSize: 12}}>PDF guide</small>
      <span>{title}</span>
      <i style={{display: 'block', height: 5, width: 44, background: '#fff', opacity: 0.85}} />
    </div>
  )
}
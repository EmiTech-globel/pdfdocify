import Image from 'next/image'
export default function Cover({title, color, image}: {title: string; color?: string; image?: string}) {
  if (image) {
    return (
      <div style={{position: 'relative', aspectRatio: '3 / 4', borderRadius: 6, overflow: 'hidden'}}>
        <Image src={image} alt={title} fill sizes="(max-width: 600px) 100vw, 320px" style={{objectFit: 'cover'}} />
      </div>
    )
  }
  return (
    <div className="cover" style={{background: color || '#6B63C9'}}>
      <small style={{opacity: 0.7, fontSize: 12}}>PDF guide</small>
      <span>{title}</span>
      <i style={{display: 'block', height: 5, width: 44, background: '#fff', opacity: 0.85}} />
    </div>
  )
}
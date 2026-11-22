'use client'
import dynamic from 'next/dynamic'
import {useEffect, useRef, useState} from 'react'
import Cover from './Cover'
const Hero3D = dynamic(() => import('./Hero3D'), {ssr: false, loading: () => null})

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

// Mounts the 3D scene only in the browser, pauses it when off screen, renders one still frame for
// reduced-motion users, and falls back to a flat cover if WebGL is unavailable.
export default function HeroScene({title, color, image}: {title: string; color?: string; image?: string}) {
  const ref = useRef<HTMLDivElement>(null)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [visible, setVisible] = useState(true)
  const [still, setStill] = useState(false)
  useEffect(() => {
    setWebgl(hasWebGL())
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {rootMargin: '100px'})
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="relative h-[clamp(300px,42vw,460px)] flex-[1_1_360px]" role="img" aria-label={`Cover of ${title}`}>
      {webgl === false && <div className="flex justify-center"><Cover size="lg" title={title} color={color} /></div>}
      {webgl && <Hero3D title={title} color={color ?? '#6B63C9'} image={image} still={still} paused={!visible} />}
    </div>
  )
}
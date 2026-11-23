'use client'
import {useRef, type ReactNode} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
gsap.registerPlugin(ScrollTrigger, useGSAP)

// Scroll reveal for the children of a container. Children are hidden by CSS until this runs (no flash),
// then each row fades up as it enters the viewport. Change the `key` of <Reveal> to replay it after a filter.
export default function Reveal({children, className = '', y = 28}: {children: ReactNode; className?: string; y?: number}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>(ref.current?.children ?? [])
    if (!items.length) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(items, {y, autoAlpha: 0})
      ScrollTrigger.batch(items, {
        start: 'top 92%',
        once: true,
        interval: 0.1,
        batchMax: 6,
        onEnter: (batch) => gsap.to(batch, {y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true, clearProps: 'transform'}),
      })
    })
    // Fonts and images can shift the layout after first paint, so recalculate trigger positions once loaded.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, {scope: ref})
  return <div ref={ref} data-reveal className={className}>{children}</div>
}

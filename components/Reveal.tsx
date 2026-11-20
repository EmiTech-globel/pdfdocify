'use client'
import {useRef, type ReactNode} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
gsap.registerPlugin(ScrollTrigger, useGSAP)
// Scroll reveal for the children of a container. Children start hidden via CSS and animate in once.
export default function Reveal({children, className = ''}: {children: ReactNode; className?: string}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>(ref.current!.children)
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(items, {y: 28, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: {trigger: ref.current, start: 'top 88%', once: true}})
    })
  }, {scope: ref})
  return <div ref={ref} data-reveal className={className}>{children}</div>
}

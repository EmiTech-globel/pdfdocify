'use client'
import {useRef, type ReactNode} from 'react'
import gsap from 'gsap'
import {useGSAP} from '@gsap/react'
gsap.registerPlugin(useGSAP)
// Staggered entrance for anything inside marked data-intro. Hidden by CSS until this runs, so there is no flash.
export default function HeroIntro({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('[data-intro]', {y: 24, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1})
    })
  }, {scope: ref})
  return <div ref={ref}>{children}</div>
}

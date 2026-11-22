'use client'
import {useEffect, useState} from 'react'
import {ArrowUp} from 'lucide-react'

export default function ScrollToTop({threshold = 480}: {threshold?: number}) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'})
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 inline-flex size-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition duration-200 hover:brightness-110 sm:right-8 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>
  )
}

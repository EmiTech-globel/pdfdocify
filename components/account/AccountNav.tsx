'use client'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import {useClerk} from '@clerk/nextjs'

const items = [['profile', 'Profile details'], ['orders', 'Orders'], ['security', 'Password'], ['prefs', 'Email preferences']] as const

export default function AccountNav() {
  const [active, setActive] = useState<string>('profile')
  const {signOut} = useClerk()
  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver((entries) => {
      const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (hit) setActive(hit.target.id)
    }, {rootMargin: '-20% 0px -60% 0px'})
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  const base = 'whitespace-nowrap rounded-lg px-4 py-3 no-underline'
  return (
    <nav aria-label="Account" className="-mx-5 flex flex-[1_1_220px] gap-1 overflow-x-auto px-5 pb-1 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={`${base} ${active === id ? 'bg-card font-semibold' : 'font-medium'}`}>{label}</a>
      ))}
      <Link href="/library" className={`${base} font-medium`}>My library</Link>
      <button type="button" onClick={() => signOut({redirectUrl: '/'})} className={`${base} border-0 bg-transparent text-left font-medium`}>Log out</button>
    </nav>
  )
}

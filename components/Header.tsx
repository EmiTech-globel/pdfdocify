'use client'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'
import {SignedIn, SignedOut, UserButton} from '@clerk/nextjs'
import {useCart} from '@/store/cart'

export default function Header({name}: {name: string}) {
  const count = useCart((s) => s.lines.length)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    // The header is fixed, so publish its real height for the page offset (it grows when it wraps on small screens).
    const ro = new ResizeObserver(([e]) => {
      document.documentElement.style.setProperty('--nav-h', `${Math.ceil(e.target.getBoundingClientRect().height)}px`)
    })
    if (ref.current) ro.observe(ref.current)
    return () => { window.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [])

  return (
    <header ref={ref} className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap row">
        <Link href="/" className="logo">{name}</Link>
        <nav className="row gap" aria-label="Main">
          <Link href="/">Shop</Link><Link href="/bundles">Bundles</Link><Link href="/about">About</Link>
          {mounted && (
            <>
              <SignedIn>
                <Link href="/library">My library</Link>
                <UserButton userProfileMode="navigation" userProfileUrl="/account" />
              </SignedIn>
              <SignedOut><Link href="/sign-in">Log in</Link></SignedOut>
            </>
          )}
          <Link href="/cart" className="btn sm">Cart ({mounted ? count : 0})</Link>
        </nav>
      </div>
    </header>
  )
}
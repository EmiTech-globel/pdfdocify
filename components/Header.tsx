'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import {SignedIn, SignedOut, UserButton} from '@clerk/nextjs'
import {BookOpen, Info, LogIn, Menu, Package, ShoppingCart, Store, X} from 'lucide-react'
import {useCart} from '@/store/cart'

const links = [
  {href: '/', label: 'Shop', Icon: Store},
  {href: '/bundles', label: 'Bundles', Icon: Package},
  {href: '/about', label: 'About', Icon: Info},
]

export default function Header({name}: {name: string}) {
  const count = useCart((s) => s.lines.length)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => setMounted(true), [])
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const n = mounted ? count : 0
  const current = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const link = 'no-underline transition-colors hover:text-accent'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-[18px] sm:px-8">
        <Link href="/" className="font-heading text-[22px] font-bold no-underline">{name}</Link>

        <div className="flex items-center gap-4 sm:gap-7">
          <nav className="hidden items-center gap-7 font-medium md:flex" aria-label="Main">
            {links.map(({href, label}) => (
              <Link
                key={href}
                href={href}
                className={`${link}${current(href) ? ' text-accent' : ''}`}
                aria-current={current(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
            {mounted && (
              <>
                <SignedIn><Link href="/library" className={`${link}${current('/library') ? ' text-accent' : ''}`} aria-current={current('/library') ? 'page' : undefined}>My library</Link></SignedIn>
                <SignedOut><Link href="/sign-in" className={`${link}${current('/sign-in') ? ' text-accent' : ''}`} aria-current={current('/sign-in') ? 'page' : undefined}>Log in</Link></SignedOut>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {mounted && <SignedIn><UserButton userProfileMode="navigation" userProfileUrl="/account" /></SignedIn>}
            <Link
              href="/cart"
              aria-label={`Cart, ${n} ${n === 1 ? 'item' : 'items'}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2.5 font-semibold text-white no-underline transition hover:text-white hover:brightness-110 sm:px-[18px]"
            >
              <ShoppingCart size={18} aria-hidden="true" />
              Cart ({n})
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-white text-ink md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-white px-5 pb-3 pt-1 shadow-lg md:hidden" aria-label="Mobile">
          <ul className="m-0 flex list-none flex-col p-0">
            {links.map(({href, label, Icon}) => (
              <li key={href} className="border-b border-line last:border-0">
                <Link
                  href={href}
                  className={`flex w-full items-center gap-3 py-3 font-medium no-underline transition-colors hover:text-accent${current(href) ? ' text-accent' : ''}`}
                  aria-current={current(href) ? 'page' : undefined}
                >
                  <Icon size={18} aria-hidden="true" />{label}
                </Link>
              </li>
            ))}
            <SignedIn>
              <li className="border-t border-line">
                <Link href="/library" className={`flex w-full items-center gap-3 py-3 font-medium no-underline transition-colors hover:text-accent${current('/library') ? ' text-accent' : ''}`} aria-current={current('/library') ? 'page' : undefined}><BookOpen size={18} aria-hidden="true" />My library</Link>
              </li>
            </SignedIn>
            <SignedOut>
              <li className="border-t border-line">
                <Link href="/sign-in" className="flex w-full items-center gap-3 py-3 font-medium no-underline"><LogIn size={18} aria-hidden="true" />Log in</Link>
              </li>
            </SignedOut>
          </ul>
        </nav>
      )}
    </header>
  )
}

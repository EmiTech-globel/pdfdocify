'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import {UserButton} from '@clerk/nextjs'
import {ExternalLink, History, LayoutDashboard, Menu, Package, ShoppingBag, Star, Users, X} from 'lucide-react'

const items = [
  {href: '/admin', label: 'Overview', Icon: LayoutDashboard, exact: true},
  {href: '/admin/orders', label: 'Orders', Icon: ShoppingBag},
  {href: '/admin/customers', label: 'Customers', Icon: Users},
  {href: '/admin/guides', label: 'Guides', Icon: Package},
  {href: '/admin/reviews', label: 'Reviews', Icon: Star, badge: true},
  {href: '/admin/activity', label: 'Activity log', Icon: History},
]

export default function AdminNav({pending, name}: {pending: number; name: string}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href))

  const list = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {items.map(({href, label, Icon, exact, badge}) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href, exact) ? 'page' : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium no-underline ${active(href, exact) ? 'bg-accent text-white hover:text-white' : 'text-ink hover:bg-card hover:text-ink'}`}
        >
          <Icon size={18} aria-hidden="true" />
          <span className="flex-1">{label}</span>
          {badge && pending > 0 && <span className={`rounded-full px-2 text-xs font-bold ${active(href, exact) ? 'bg-white text-accent' : 'bg-accent text-white'}`}>{pending}</span>}
        </Link>
      ))}
      <div className="my-2 border-t border-line" />
      <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium no-underline hover:bg-card"><ExternalLink size={18} aria-hidden="true" />View store</Link>
      <a href="/studio" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium no-underline hover:bg-card"><ExternalLink size={18} aria-hidden="true" />Content Studio</a>
    </nav>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-line bg-white p-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div><div className="font-heading text-xl font-bold">{name}</div><div className="text-xs font-semibold uppercase tracking-wide text-mute">Admin</div></div>
        {list}
        <div className="mt-auto flex items-center gap-3"><UserButton /><span className="text-sm text-mute">Signed in</span></div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-line bg-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="font-heading text-lg font-bold">{name} <span className="text-sm font-medium text-mute">Admin</span></div>
          <div className="flex items-center gap-3">
            <UserButton />
            <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-white text-ink">
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && <div className="absolute inset-x-0 top-full border-b border-line bg-white p-4 shadow-lg">{list}</div>}
      </header>
    </>
  )
}

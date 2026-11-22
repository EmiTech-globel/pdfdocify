import type {Metadata} from 'next'
import Link from 'next/link'
import {ClerkProvider} from '@clerk/nextjs'
import Header from '@/components/Header'
import {q} from '@/lib/sanity'
import {settingsQ, type Settings} from '@/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const s = await q<Settings>(settingsQ)
  return {title: {default: s?.name ?? 'Guide store', template: `%s | ${s?.name ?? 'Guide store'}`}, description: s?.tagline}
}

export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const s = await q<Settings>(settingsQ)
  return (
    <ClerkProvider>
      <noscript><style>{'[data-intro],[data-reveal]>*{opacity:1!important}'}</style></noscript>
      <Header name={s?.name ?? 'Guide store'} />
      <main className="site-main">{children}</main>
      <footer>
        <div className="wrap row">
          <div>{s?.footerNote ?? s?.name}</div>
          <div className="row gap">
            <Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><Link href="/privacy">Privacy</Link><Link href="/about">Contact</Link>
          </div>
        </div>
      </footer>
    </ClerkProvider>
  )
}
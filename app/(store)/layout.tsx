import type {Metadata} from 'next'
import Link from 'next/link'
import {ClerkProvider} from '@clerk/nextjs'
import Header from '@/components/Header'
import {clerkAppearance, clerkLocalization} from '@/lib/clerk-theme'
import ScrollToTop from '@/components/ScrollToTop'
import {q} from '@/lib/sanity'
import {settingsQ, type Settings} from '@/lib/queries'
import {wrap} from '@/lib/ui'

export async function generateMetadata(): Promise<Metadata> {
  const s = await q<Settings>(settingsQ)
  return {title: {default: s?.name ?? 'Guide store', template: `%s | ${s?.name ?? 'Guide store'}`}, description: s?.tagline}
}

const footerLinks = [['Terms', '/terms'], ['Refunds', '/refunds'], ['Privacy', '/privacy'], ['Contact', '/about']]

export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const s = await q<Settings>(settingsQ)
  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      <noscript><style>{'[data-intro],[data-reveal]>*{opacity:1!important}'}</style></noscript>
      <div className="store flex min-h-screen flex-col">
        <Header name={s?.name ?? 'Guide store'} />
        <main className="flex-1">{children}</main>
        <footer className={`${wrap} flex flex-wrap justify-between gap-4 pb-10 pt-14 text-sm text-mute`}>
          <div>{s?.footerNote ?? s?.name}</div>
          <div className="flex gap-6">
            {footerLinks.map(([label, href]) => <Link key={href} href={href} className="text-mute underline hover:text-accent">{label}</Link>)}
          </div>
        </footer>
        <ScrollToTop />
      </div>
    </ClerkProvider>
  )
}

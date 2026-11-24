import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ClerkProvider} from '@clerk/nextjs'
import {auth} from '@clerk/nextjs/server'
import {isAdmin} from '@/lib/admin'
import {pendingReviewCount} from '@/lib/admin-data'
import {clerkAppearance} from '@/lib/clerk-theme'
import {q} from '@/lib/sanity'
import {settingsQ, type Settings} from '@/lib/queries'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = {title: {default: 'Admin', template: '%s | Admin'}, robots: {index: false, follow: false}}
export const dynamic = 'force-dynamic'

// Everything under /admin requires a Clerk user listed in ADMIN_USER_IDS. Anyone else gets a plain 404.
export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const {userId} = await auth()
  if (!isAdmin(userId)) notFound()
  const [pending, s] = await Promise.all([pendingReviewCount().catch(() => 0), q<Settings>(settingsQ).catch(() => null)])
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <div className="store flex min-h-screen flex-col bg-[#F7F8FB] bg-none lg:flex-row">
        <AdminNav pending={pending} name={s?.name ?? 'Store'} />
        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </ClerkProvider>
  )
}

import Link from 'next/link'
import {auth} from '@clerk/nextjs/server'
import {libraryFor} from '@/lib/library'
import LibraryList from '@/components/LibraryList'
import HelpBand from '@/components/HelpBand'
import {btnPrimary, wrap} from '@/lib/ui'

export const metadata = {title: 'My library'}
export const dynamic = 'force-dynamic'

export default async function Library() {
  const {userId} = await auth()
  const guides = userId ? await libraryFor(userId) : []
  return (
    <div className={`${wrap} pb-[72px] pt-10 sm:pt-14`}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-heading text-[28px] font-bold">My library</h1>
        <Link href="/account" className="font-semibold underline">Account settings</Link>
      </div>
      {!guides.length ? (
        <div className="mt-4 flex flex-col items-start gap-5 rounded-[14px] bg-card p-7">
          <p className="text-mute">You have no guides yet. Pick one from the shop and it will appear here.</p>
          <Link href="/#guides" className={btnPrimary}>Browse the shop</Link>
        </div>
      ) : <LibraryList guides={guides} />}
      <HelpBand />
    </div>
  )
}

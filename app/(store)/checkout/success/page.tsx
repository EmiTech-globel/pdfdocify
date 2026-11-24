import Link from 'next/link'
import {Check} from 'lucide-react'
import {auth} from '@clerk/nextjs/server'
import {fulfil} from '@/lib/fulfil'
import {libraryFor} from '@/lib/library'
import {orderNoByReference} from '@/lib/orders'
import ClearCart from '@/components/ClearCart'
import LibraryList from '@/components/LibraryList'
import HelpBand from '@/components/HelpBand'
import {btnPrimary, wrap} from '@/lib/ui'

export const metadata = {title: 'Payment status'}

export default async function Success({searchParams}: {searchParams: Promise<{reference?: string}>}) {
  const {reference} = await searchParams
  const ok = typeof reference === 'string' && /^trx_[a-f0-9]{32}$/.test(reference) && (await fulfil(reference))
  const {userId} = await auth()
  const guides = ok && userId ? await libraryFor(userId) : []
  const orderNo = ok && reference ? await orderNoByReference(reference).catch(() => '') : ''
  return (
    <div className={`${wrap} pb-[72px] pt-10 sm:pt-14`}>
      {ok ? (
        <>
          <ClearCart />
          <div className="mb-10 flex flex-wrap items-center gap-5 rounded-[14px] bg-card p-6 sm:p-8">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent"><Check size={22} aria-hidden="true" /></span>
            <div>
              <h1 className="font-heading text-[clamp(26px,4vw,34px)] font-bold leading-tight tracking-[-0.02em]">Payment received. Thank you.</h1>
              <div className="text-mute">{orderNo && `Order ${orderNo}. `}Your guides are ready to download below and stay in My library.</div>
            </div>
          </div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-[28px] font-bold">My library</h2>
            <Link href="/account" className="font-semibold underline">Account settings</Link>
          </div>
          <LibraryList guides={guides} />
          <HelpBand />
        </>
      ) : (
        <div className="flex max-w-[760px] flex-col items-start gap-4 rounded-[14px] bg-card p-6 sm:p-8">
          <h1 className="font-heading text-[clamp(26px,4vw,34px)] font-bold leading-tight tracking-[-0.02em]">We could not confirm this payment yet</h1>
          <p className="text-mute">If you were charged, your guides appear in My library within a few minutes. If they do not, contact us with your payment reference.</p>
          <Link href="/library" className={btnPrimary}>Check My library</Link>
        </div>
      )}
    </div>
  )
}

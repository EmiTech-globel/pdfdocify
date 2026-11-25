import Link from 'next/link'
import {Check} from 'lucide-react'
import {auth} from '@clerk/nextjs/server'
import {fulfil, type FulfilResult} from '@/lib/fulfil'
import {libraryFor} from '@/lib/library'
import {orderNoByReference} from '@/lib/orders'
import AutoRefresh from '@/components/AutoRefresh'
import ClearCart from '@/components/ClearCart'
import LibraryList from '@/components/LibraryList'
import HelpBand from '@/components/HelpBand'
import {btnPrimary, wrap} from '@/lib/ui'

export const metadata = {title: 'Payment status'}

const copy: Record<string, {title: string; text: string; action: [string, string]}> = {
  processing: {title: 'Your payment is still processing', text: 'Bank transfer and USSD payments can take a few minutes to confirm. This page checks again by itself, and your guides will appear in My library as soon as the payment is confirmed.', action: ['Check My library', '/library']},
  abandoned: {title: 'The payment was not completed', text: 'No guides were added and nothing was charged for this attempt. Your cart is still saved, so you can try again.', action: ['Back to cart', '/cart']},
  failed: {title: 'The payment did not go through', text: 'Your bank or card did not approve this payment, so no guides were added. Your cart is still saved. You can try again or use a different payment method.', action: ['Back to cart', '/cart']},
  other: {title: 'We could not confirm this payment yet', text: 'If you were charged, your guides appear in My library within a few minutes. If they do not, contact us with the payment reference below.', action: ['Check My library', '/library']},
}

export default async function Success({searchParams}: {searchParams: Promise<{reference?: string; trxref?: string}>}) {
  const sp = await searchParams
  const reference = [sp.reference, sp.trxref].find((r) => typeof r === 'string' && /^trx_[a-f0-9]{32}$/.test(r))
  const result: FulfilResult = reference ? await fulfil(reference) : {ok: false, reason: 'not_found'}
  const ok = result.ok
  const {userId} = await auth()
  const guides = ok && userId ? await libraryFor(userId) : []
  const orderNo = ok && reference ? await orderNoByReference(reference).catch(() => '') : ''
  const c = !ok ? copy[result.reason === 'processing' || result.reason === 'abandoned' || result.reason === 'failed' ? result.reason : 'other'] : null

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
      ) : c && (
        <div className="flex max-w-[760px] flex-col items-start gap-4 rounded-[14px] bg-card p-6 sm:p-8">
          {!ok && result.reason === 'processing' && <AutoRefresh />}
          <h1 className="font-heading text-[clamp(26px,4vw,34px)] font-bold leading-tight tracking-[-0.02em]">{c.title}</h1>
          <p className="text-mute">{c.text}</p>
          {reference && <p className="break-all text-sm text-mute">Payment reference: <span className="font-mono">{reference}</span></p>}
          <Link href={c.action[1]} className={btnPrimary}>{c.action[0]}</Link>
        </div>
      )}
    </div>
  )
}

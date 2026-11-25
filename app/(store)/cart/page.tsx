'use client'
import {useEffect, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {useUser} from '@clerk/nextjs'
import {useCart} from '@/store/cart'
import Cover from '@/components/Cover'
import {naira} from '@/lib/queries'
import {btnPrimary, field, label, wrap} from '@/lib/ui'

const messages: Record<string, string> = {
  rate_limited: 'Too many attempts. Wait a minute and try again.',
  item_unavailable: 'One of these items is no longer available. Remove it and try again.',
  payment_unavailable: 'Payment could not start. Try again in a moment.',
  email_required: 'Your account needs an email address before you can pay.',
  bad_price: 'A price in this cart is not a whole number of naira, so it cannot be charged. The site owner needs to fix it in Studio (for example 7500, not 7499.9).',
  forbidden: 'This web address is not allowed to start a payment. The site owner needs to check the site URL setting.',
  server_error: 'The server could not start the payment. The site owner can find the reason in the server logs.',
}

export default function Cart() {
  const {lines: stored, remove} = useCart()
  const {user} = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [owned, setOwned] = useState(false)
  useEffect(() => setMounted(true), [])
  const lines = mounted ? stored : []
  const total = lines.reduce((n, l) => n + l.price, 0)

  async function pay() {
    setBusy(true); setError(''); setOwned(false)
    const res = await fetch('/api/checkout', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({items: lines.map((l) => ({type: l.type, slug: l.slug}))})})
    if (res.status === 401) return router.push('/sign-in?redirect_url=/cart')
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.url) return void (window.location.href = data.url)
    if (data.error === 'already_owned') setOwned(true)
    else setError(messages[data.error] ?? `Something went wrong. Try again. (${data.error ?? `status ${res.status}`})`)
    setBusy(false)
  }

  return (
    <div className={`${wrap} pb-[72px] pt-10 sm:pt-12`}>
      <h1 className="mb-8 font-heading text-[40px] font-bold tracking-[-0.02em]">Checkout</h1>
      {!lines.length ? (
        <div className="flex flex-col items-start gap-5">
          <p className="text-mute">{mounted ? 'Your cart is empty. Pick a guide from the shop to get started.' : 'Loading your cart...'}</p>
          {mounted && <Link href="/#guides" className={btnPrimary}>Browse guides</Link>}
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-10">
          <div className="flex flex-[2_1_460px] flex-col gap-6">
            <section className="rounded-[14px] bg-card px-5 py-2 sm:px-7">
              <h2 className="mt-5 font-heading text-[22px] font-bold">Your cart ({lines.length})</h2>
              {lines.map((l) => (
                <div key={l.type + l.slug} className="flex flex-wrap items-center gap-4 border-b border-line py-5">
                  <Cover size="thumb" title={l.title} color={l.color} image={l.image} />
                  <div className="min-w-0 flex-[1_1_160px]">
                    <strong>{l.title}</strong>
                    <div className="text-sm text-mute">{l.meta ?? (l.type === 'bundle' ? 'Bundle' : 'PDF guide')}</div>
                  </div>
                  <strong>{naira(l.price)}</strong>
                  <button type="button" onClick={() => remove(l.type, l.slug)} className="border-0 bg-transparent p-0 text-sm text-ink underline hover:text-accent">Remove</button>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-4 rounded-[14px] bg-card p-6 sm:p-7">
              <h2 className="font-heading text-[22px] font-bold">Where should we send your guides?</h2>
              <label className={label}>Full name<input type="text" readOnly value={user?.fullName ?? ''} placeholder="Your full name" className={field} /></label>
              <label className={label}>Email address<input type="email" readOnly value={user?.primaryEmailAddress?.emailAddress ?? ''} placeholder="you@example.com" className={field} /></label>
              <div className="text-sm text-mute">These come from your account. Your guides appear in My library as soon as payment is confirmed.</div>
            </section>

            <section className="flex flex-col gap-4 rounded-[14px] bg-card p-6 sm:p-7">
              <h2 className="font-heading text-[22px] font-bold">Payment</h2>
              <div className="rounded-lg border-2 border-accent px-4 py-3.5 font-semibold">Paystack: card, bank transfer or USSD</div>
              <div className="text-sm text-mute">Payment is handled on the provider's secure page.</div>
            </section>
          </div>

          <aside className="flex flex-[1_1_300px] flex-col gap-3.5 rounded-[14px] bg-accent p-6 text-white sm:p-7">
            <h2 className="font-heading text-[22px] font-bold">Order summary</h2>
            <div className="flex justify-between"><span>Subtotal</span><span>{naira(total)}</span></div>
            <div className="flex justify-between"><span>Discount code</span><span>None applied</span></div>
            <div className="flex justify-between border-t border-white/35 pt-3.5 font-heading text-[26px] font-bold"><span>Total</span><span>{naira(total)}</span></div>
            <button
              type="button"
              disabled={busy}
              onClick={pay}
              className="rounded-[10px] border-0 bg-white p-[15px] text-[17px] font-semibold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Starting payment...' : 'Pay and download'}
            </button>
            <div className="text-center text-[13px] text-accent-soft">Instant delivery. Refund terms in the policy.</div>
            {owned && (
              <div role="alert" className="rounded-lg bg-white px-3.5 py-3 text-sm text-ink">
                You already own every guide in this cart, so there is nothing to buy.{' '}
                <Link href="/library" className="font-semibold underline">Open My library</Link> to download them.
              </div>
            )}
            {error && <div role="alert" className="rounded-lg bg-white px-3.5 py-3 text-sm text-[#B3261E]">{error}</div>}
          </aside>
        </div>
      )}
    </div>
  )
}

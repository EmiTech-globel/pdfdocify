'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {useCart} from '@/store/cart'
const naira = (n: number) => '₦' + n.toLocaleString('en-NG')
const messages: Record<string, string> = {
  already_owned: 'You already own everything in this cart. Open My library to download it.',
  rate_limited: 'Too many attempts. Wait a minute and try again.',
  item_unavailable: 'One of these items is no longer available. Remove it and try again.',
  payment_unavailable: 'Payment could not start. Try again in a moment.',
}
export default function Cart() {
  const {lines, remove} = useCart()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const total = lines.reduce((n, l) => n + l.price, 0)
  async function pay() {
    setBusy(true); setError('')
    const res = await fetch('/api/checkout', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({items: lines.map((l) => ({type: l.type, slug: l.slug}))})})
    if (res.status === 401) return router.push('/sign-in?redirect_url=/cart')
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.url) return void (window.location.href = data.url)
    setError(messages[data.error] ?? 'Something went wrong. Try again.'); setBusy(false)
  }
  return (
    <section className="wrap">
      <h1 style={{fontSize: 40, marginBottom: 24}}>Your cart</h1>
      {!lines.length ? <p className="mute">Your cart is empty. Pick a guide from the shop to get started.</p> : (
        <div className="split">
          <div className="panel" style={{flex: '2 1 460px'}}>
            {lines.map((l) => (
              <div className="line" key={l.type + l.slug}>
                <div><strong>{l.title}</strong><div className="mute" style={{fontSize: 14}}>{l.type === 'bundle' ? 'Bundle' : 'PDF guide'}</div></div>
                <div className="row gap"><strong>{naira(l.price)}</strong><button className="btn sm alt" onClick={() => remove(l.type, l.slug)}>Remove</button></div>
              </div>
            ))}
          </div>
          <div className="panel" style={{flex: '1 1 300px', alignSelf: 'flex-start'}}>
            <h2 style={{fontSize: 22}}>Order summary</h2>
            <div className="row"><span>Total</span><strong style={{fontSize: 28}}>{naira(total)}</strong></div>
            <button className="btn" disabled={busy} onClick={pay}>{busy ? 'Starting payment...' : 'Pay with Paystack'}</button>
            <span className="mute" style={{fontSize: 13}}>Card, bank transfer or USSD on Paystack's secure page. The final price is confirmed on the server.</span>
            {error && <span className="err" role="alert">{error}</span>}
          </div>
        </div>
      )}
    </section>
  )
}

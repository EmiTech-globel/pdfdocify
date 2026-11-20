import Link from 'next/link'
import {fulfil} from '@/lib/fulfil'
import ClearCart from '@/components/ClearCart'
export const metadata = {title: 'Payment status'}
export default async function Success({searchParams}: {searchParams: Promise<{reference?: string}>}) {
  const {reference} = await searchParams
  const ok = typeof reference === 'string' && /^trx_[a-f0-9]{32}$/.test(reference) && (await fulfil(reference))
  return (
    <section className="wrap prose">
      {ok ? (<><ClearCart /><h1 style={{fontSize: 40, marginBottom: 12}}>Payment received. Thank you.</h1>
        <p className="mute">Your guides are ready in your library.</p><Link href="/library" className="btn">Open My library</Link></>)
        : (<><h1 style={{fontSize: 40, marginBottom: 12}}>We could not confirm this payment yet</h1>
        <p className="mute">If you were charged, your guides appear in My library within a few minutes. If they do not, contact us with your payment reference.</p><Link href="/library" className="btn">Check My library</Link></>)}
    </section>
  )
}

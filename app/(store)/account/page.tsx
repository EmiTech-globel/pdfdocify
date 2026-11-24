import Link from 'next/link'
import {User} from 'lucide-react'
import {auth} from '@clerk/nextjs/server'
import {naira} from '@/lib/queries'
import {formatOrderNo, ordersForUser} from '@/lib/orders'
import AccountNav from '@/components/account/AccountNav'
import ProfileForm from '@/components/account/ProfileForm'
import PasswordForm from '@/components/account/PasswordForm'
import PrefsForm from '@/components/account/PrefsForm'
import {Panel} from '@/components/account/Panel'
import {wrap} from '@/lib/ui'

export const metadata = {title: 'Account'}
export const dynamic = 'force-dynamic'

const day = (d: Date | string) => new Date(d).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})

export default async function Account() {
  const {userId} = await auth()
  let orders: Awaited<ReturnType<typeof ordersForUser>> = []
  let ordersError = false
  if (userId) { try { orders = await ordersForUser(userId) } catch { ordersError = true } }

  return (
    <>
      <div className={`${wrap} flex flex-wrap items-center gap-5 pb-6 pt-10 sm:pt-14`}>
        <div className="flex size-16 items-center justify-center rounded-full bg-accent text-white"><User size={30} aria-hidden="true" /></div>
        <div>
          <h1 className="font-heading text-[clamp(30px,5vw,40px)] font-bold tracking-[-0.02em]">Your account</h1>
          <div className="text-mute">Manage your details, orders and download access.</div>
        </div>
      </div>

      <div className={`${wrap} flex flex-wrap items-start gap-x-10 gap-y-6 pb-16 pt-4`}>
        <AccountNav />
        <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-6">
          <ProfileForm />

          <Panel id="orders" title="Orders">
            {ordersError ? <p className="text-mute">Your orders could not be loaded right now. Try again in a moment.</p>
              : orders.length === 0 ? <p className="text-mute">No orders yet. <Link href="/guides" className="font-semibold underline">Browse the guides</Link>.</p>
              : (
                <div className="-mt-2">
                  {orders.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3.5">
                      <div className="min-w-0 flex-[1_1_220px]">
                        <strong>Order {formatOrderNo(o.order_no) || ''}</strong>
                        <div className="text-sm text-mute">{o.items} {o.items === 1 ? 'guide' : 'guides'}{o.status === 'refunded' ? ' / Refunded' : ''}</div>
                        {o.titles && <div className="line-clamp-2 text-sm text-mute">{o.titles}</div>}
                      </div>
                      <div className="text-sm text-mute">{day(o.created_at)}</div>
                      <strong>{naira(Number(o.amount_kobo) / 100)}</strong>
                      {o.status === 'paid' ? <Link href="/library" className="text-sm font-semibold">Download</Link> : <span className="text-sm text-mute">Refunded</span>}
                    </div>
                  ))}
                </div>
              )}
          </Panel>

          <PasswordForm />
          <PrefsForm />
          <div className="text-sm text-mute">Need to close your account? <Link href="/about" className="font-semibold">Contact us</Link> and we will delete it.</div>
        </div>
      </div>
    </>
  )
}

import {UserProfile} from '@clerk/nextjs'
import {User} from 'lucide-react'
import {wrap} from '@/lib/ui'

export const metadata = {title: 'Account'}

export default function Account() {
  return (
    <>
      <div className={`${wrap} flex flex-wrap items-center gap-5 pb-6 pt-10 sm:pt-14`}>
        <div className="flex size-16 items-center justify-center rounded-full bg-accent text-white"><User size={30} aria-hidden="true" /></div>
        <div>
          <h1 className="font-heading text-[40px] font-bold tracking-[-0.02em]">Your account</h1>
          <div className="text-mute">Manage your details, orders and download access.</div>
        </div>
      </div>
      <div className={`${wrap} pb-16 pt-4`}>
        <UserProfile path="/account" appearance={{elements: {rootBox: 'w-full', cardBox: 'w-full max-w-none rounded-[14px] border-0 shadow-none'}}} />
      </div>
    </>
  )
}

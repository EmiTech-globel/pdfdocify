import Link from 'next/link'
import {btnWhite} from '@/lib/ui'

export default function HelpBand() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-[14px] bg-accent px-6 py-7 text-white sm:px-8">
      <div>
        <strong className="text-lg">Need help with a download?</strong>
        <div className="text-[15px] text-accent-soft">Email us or message us on WhatsApp. We reply within 24 hours on working days.</div>
      </div>
      <Link href="/about" className={btnWhite}>Contact support</Link>
    </div>
  )
}

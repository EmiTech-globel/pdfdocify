import Link from 'next/link'
import {notFound} from 'next/navigation'
import {auth} from '@clerk/nextjs/server'
import {isAdmin} from '@/lib/admin'
import {reviewsByStatus, type Review} from '@/lib/reviews'
import Stars from '@/components/Stars'
import {wrap} from '@/lib/ui'
import {deleteReview, setReviewStatus} from './actions'

export const metadata = {title: 'Review moderation'}
export const dynamic = 'force-dynamic'

const tabs: Review['status'][] = ['pending', 'approved', 'rejected']

export default async function AdminReviews({searchParams}: {searchParams: Promise<{status?: string}>}) {
  const {userId} = await auth()
  if (!isAdmin(userId)) notFound()
  const sp = await searchParams
  const status = (tabs as string[]).includes(sp.status ?? '') ? (sp.status as Review['status']) : 'pending'
  const reviews = await reviewsByStatus(status)
  const btn = 'rounded-lg border-0 px-4 py-2 text-sm font-semibold'

  return (
    <div className={`${wrap} pb-16 pt-10 sm:pt-14`}>
      <h1 className="mb-6 font-heading text-[34px] font-bold">Review moderation</h1>
      <nav className="mb-8 flex gap-2.5" aria-label="Status">
        {tabs.map((t) => (
          <Link key={t} href={`/admin/reviews?status=${t}`} aria-current={status === t ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize no-underline ${status === t ? 'bg-accent text-white hover:text-white' : 'bg-card text-ink hover:text-ink'}`}>{t}</Link>
        ))}
      </nav>

      {reviews.length === 0 ? <p className="text-mute">No {status} reviews.</p> : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-[14px] bg-card p-5 sm:p-6">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Stars value={r.rating} />
                <Link href={`/guides/${r.productSlug}`} className="font-semibold">{r.productSlug}</Link>
                <span className="text-mute">{r.name} / {r.createdAt.toLocaleString('en-GB')}</span>
              </div>
              {r.title && <strong>{r.title}</strong>}
              <p className="whitespace-pre-line text-body">{r.body}</p>
              {r.media.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {r.media.map((m) => m.kind === 'image' ? (
                    <a key={m.id} href={`/api/reviews/media/${m.id}`} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/reviews/media/${m.id}`} alt="Review photo" loading="lazy" className="size-24 rounded-lg object-cover" />
                    </a>
                  ) : (
                    <video key={m.id} controls preload="metadata" playsInline className="max-h-60 max-w-full rounded-lg bg-ink"><source src={`/api/reviews/media/${m.id}`} type={m.contentType} /></video>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {status !== 'approved' && (
                  <form action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="approved" /><button className={`${btn} bg-accent text-white`}>Approve</button></form>
                )}
                {status !== 'rejected' && (
                  <form action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><button className={`${btn} bg-white text-ink`}>Reject</button></form>
                )}
                <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className={`${btn} bg-white text-[#B3261E]`}>Delete</button></form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

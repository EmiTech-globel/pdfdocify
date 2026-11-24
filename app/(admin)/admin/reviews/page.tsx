import Link from 'next/link'
import {reviewsByStatus, type Review} from '@/lib/reviews'
import {reviewCounts} from '@/lib/admin-data'
import Stars from '@/components/Stars'
import {PageHead, btnCls, card, when} from '@/components/admin/ui'
import {deleteReview, setReviewStatus} from './actions'

export const metadata = {title: 'Reviews'}

const tabs: Review['status'][] = ['pending', 'approved', 'rejected']

export default async function AdminReviews({searchParams}: {searchParams: Promise<{status?: string}>}) {
  const sp = await searchParams
  const status = (tabs as string[]).includes(sp.status ?? '') ? (sp.status as Review['status']) : 'pending'
  const [reviews, counts] = await Promise.all([reviewsByStatus(status), reviewCounts()])
  return (
    <>
      <PageHead title="Reviews" sub="Reviews stay hidden until you approve them." />
      <nav className="mb-6 flex flex-wrap gap-2.5" aria-label="Status">
        {tabs.map((t) => (
          <Link key={t} href={`/admin/reviews?status=${t}`} aria-current={status === t ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize no-underline ${status === t ? 'bg-accent text-white hover:text-white' : 'bg-white text-ink ring-1 ring-line hover:text-ink'}`}>{t} ({counts[t] ?? 0})</Link>
        ))}
      </nav>
      {reviews.length === 0 ? <p className="text-mute">No {status} reviews.</p> : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <article key={r.id} className={card}>
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Stars value={r.rating} />
                <Link href={`/guides/${r.productSlug}#reviews`} className="font-semibold">{r.productSlug}</Link>
                <span className="text-mute">{r.name} / {when(r.createdAt)}</span>
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
                {status !== 'approved' && <form action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="approved" /><button className={`${btnCls} bg-accent text-white`}>Approve</button></form>}
                {status !== 'rejected' && <form action={setReviewStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><button className={`${btnCls} bg-white text-ink ring-1 ring-line`}>Reject</button></form>}
                <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className={`${btnCls} bg-white text-[#B3261E] ring-1 ring-line`}>Delete</button></form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

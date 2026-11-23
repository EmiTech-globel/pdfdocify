import Link from 'next/link'
import {BadgeCheck} from 'lucide-react'
import {auth, currentUser} from '@clerk/nextjs/server'
import {approvedReviews, myReview, ownsGuide, ratingSummary} from '@/lib/reviews'
import ReviewForm from './ReviewForm'
import Reveal from './Reveal'
import Stars from './Stars'

const date = (d: Date) => d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})

export default async function Reviews({slug}: {slug: string}) {
  try {
    const {userId} = await auth()
    const [list, summary, mine, owns] = await Promise.all([
      approvedReviews(slug), ratingSummary(slug),
      userId ? myReview(slug, userId) : null,
      userId ? ownsGuide(slug, userId) : false,
    ])
    const user = userId && owns && !mine ? await currentUser() : null
    const defaultName = user ? [user.firstName, user.lastName?.[0] ? `${user.lastName[0]}.` : ''].filter(Boolean).join(' ') || user.username || '' : ''

    return (
      <div id="reviews" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading text-[30px] font-bold">Reviews</h2>
          {summary.count > 0 && (
            <div className="flex items-center gap-2">
              <Stars value={summary.avg} />
              <span className="text-sm text-body">{summary.avg.toFixed(1)} ({summary.count} {summary.count === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <p className="mb-8 text-mute">No reviews yet. Buyers can leave the first one.</p>
        ) : (
          <Reveal className="mb-8 flex flex-col gap-4" y={16}>
            {list.map((r) => (
              <article key={r.id} className="rounded-[14px] bg-card p-5 sm:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} />
                  {r.title && <strong>{r.title}</strong>}
                </div>
                <p className="whitespace-pre-line text-body">{r.body}</p>
                {r.media.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {r.media.map((m) => m.kind === 'image' ? (
                      <a key={m.id} href={`/api/reviews/media/${m.id}`} target="_blank" rel="noopener noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/api/reviews/media/${m.id}`} alt={`Photo from ${r.name}'s review`} loading="lazy" className="size-24 rounded-lg object-cover sm:size-28" />
                      </a>
                    ) : (
                      <video key={m.id} controls preload="metadata" playsInline className="max-h-72 max-w-full rounded-lg bg-ink" aria-label={`Video from ${r.name}'s review`}>
                        <source src={`/api/reviews/media/${m.id}`} type={m.contentType} />
                      </video>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mute">
                  <span className="font-semibold text-ink">{r.name}</span>
                  <span className="inline-flex items-center gap-1"><BadgeCheck size={15} aria-hidden="true" />Verified purchase</span>
                  <span>{date(r.createdAt)}</span>
                </div>
              </article>
            ))}
          </Reveal>
        )}

        {!userId ? (
          <p className="text-mute"><Link href={`/sign-in?redirect_url=/guides/${slug}`} className="font-semibold underline">Log in</Link> to review a guide you bought.</p>
        ) : mine ? (
          <p className="rounded-[14px] bg-card p-5 text-body">
            {mine.status === 'approved' ? 'Your review is published. Thank you.' : mine.status === 'pending' ? 'Your review is waiting for approval. Thank you.' : 'Your review was not approved.'}
          </p>
        ) : owns ? (
          <ReviewForm slug={slug} defaultName={defaultName} />
        ) : (
          <p className="text-mute">Only buyers can review a guide. Buy it to share your results.</p>
        )}
      </div>
    )
  } catch {
    return null
  }
}

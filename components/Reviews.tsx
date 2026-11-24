import Link from 'next/link'
import {Check} from 'lucide-react'
import {auth, currentUser} from '@clerk/nextjs/server'
import {approvedReviews, myReview, ownsGuide, ratingSummary} from '@/lib/reviews'
import ReviewForm from './ReviewForm'
import Reveal from './Reveal'
import Stars from './Stars'

const date = (d: Date) => d.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})

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
    const note = mine
      ? mine.status === 'approved' ? 'Your review is published. Thank you.' : mine.status === 'pending' ? 'Your review is waiting for approval. Thank you.' : 'Your review was not approved.'
      : owns ? 'You bought this guide, so you can review it.' : 'Only people who bought this guide can leave a review.'

    return (
      <div id="reviews" className="scroll-mt-24">
        <h2 className="mb-6 font-heading text-[30px] font-bold">Reviews</h2>

        <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
          <aside className="flex w-full flex-[1_1_320px] flex-col gap-4 rounded-[14px] bg-card p-6 sm:p-8 lg:sticky lg:top-24 lg:max-w-[400px]">
            {summary.count > 0 ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-[56px] font-bold leading-none">{summary.avg.toFixed(1)}</span>
                  <span className="text-body">out of 5</span>
                </div>
                <Stars value={summary.avg} size={20} />
                <div className="text-sm text-mute">Based on {summary.count} verified {summary.count === 1 ? 'review' : 'reviews'}</div>
                <div className="flex flex-col gap-2 pt-1" aria-label="Rating breakdown">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-3 text-body">{star}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{width: `${(summary.dist[star] / summary.count) * 100}%`}} /></div>
                      <span className="w-6 text-right text-accent">{summary.dist[star]}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="font-heading text-[26px] font-bold leading-tight">No reviews yet</div>
                <p className="text-sm text-mute">Buyers can leave the first one.</p>
              </>
            )}
            <a href="#write-review" className="mt-2 inline-flex items-center justify-center rounded-[10px] bg-accent px-6 py-3.5 font-semibold text-white no-underline transition hover:text-white hover:brightness-110">Write a review</a>
            <p className="text-sm text-mute">{note}</p>
          </aside>

          <div className="min-w-0 flex-[2_1_420px]">
            {list.length === 0 ? (
              <p className="border-t border-line py-6 text-mute">Reviews from buyers will appear here.</p>
            ) : (
              <Reveal className="border-t border-line" y={14}>
                {list.map((r) => (
                  <article key={r.id} className="border-b border-line py-6">
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mute">
                      <span>{r.name}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-accent"><Check size={14} strokeWidth={2.5} aria-hidden="true" />Verified purchase</span>
                      <span>{date(r.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </Reveal>
            )}
          </div>
        </div>

        <div id="write-review" className="mt-10 scroll-mt-24">
          {!userId ? (
            <p className="text-mute"><Link href={`/sign-in?redirect_url=/guides/${slug}`} className="font-semibold underline">Log in</Link> to review a guide you bought.</p>
          ) : mine ? (
            <p className="rounded-[14px] bg-card p-5 text-body">{note}</p>
          ) : owns ? (
            <ReviewForm slug={slug} defaultName={defaultName} />
          ) : (
            <p className="text-mute">{note} Buy this guide to share your results.</p>
          )}
        </div>
      </div>
    )
  } catch {
    return null
  }
}

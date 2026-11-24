'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {Camera, Film, Star, X} from 'lucide-react'
import {IMAGE_TYPES, LIMITS, VIDEO_TYPES, mb} from '@/lib/review-rules'
import {btnPrimary, field, label} from '@/lib/ui'

const messages: Record<string, string> = {
  rate_limited: 'Too many attempts. Wait a minute and try again.',
  already_reviewed: 'You have already reviewed this guide.',
  not_purchased: 'Only buyers can review this guide.',
  bad_type: 'Photos must be JPG, PNG or WebP. Videos must be MP4, WebM or MOV.',
  image_too_large: `Each photo must be under ${mb(LIMITS.imageBytes)} MB.`,
  video_too_large: `The video must be under ${mb(LIMITS.videoBytes)} MB.`,
  too_many_images: `You can add up to ${LIMITS.images} photos.`,
  too_many_videos: 'You can add one video.',
  bad_media: 'One of the files could not be verified. Remove it and try again.',
  upload_failed: 'A file could not be uploaded. Check your connection and try again.',
}

function putFile(url: string, file: File, onProgress: (loaded: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest()
    x.open('PUT', url)
    x.setRequestHeader('Content-Type', file.type)
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded)
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error('upload_failed')))
    x.onerror = () => reject(new Error('upload_failed'))
    x.send(file)
  })
}

export default function ReviewForm({slug, defaultName}: {slug: string; defaultName: string}) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState(defaultName)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  function addImages(list: FileList | null) {
    if (!list) return
    setError('')
    const next = [...images]
    for (const f of Array.from(list)) {
      if (!(f.type in IMAGE_TYPES)) { setError(messages.bad_type); continue }
      if (f.size > LIMITS.imageBytes) { setError(messages.image_too_large); continue }
      if (next.length >= LIMITS.images) { setError(messages.too_many_images); break }
      next.push(f)
    }
    setImages(next)
  }
  function addVideo(list: FileList | null) {
    const f = list?.[0]
    if (!f) return
    setError('')
    if (!(f.type in VIDEO_TYPES)) return setError(messages.bad_type)
    if (f.size > LIMITS.videoBytes) return setError(messages.video_too_large)
    setVideo(f)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!rating) return setError('Choose a star rating.')
    if (text.trim().length < 10) return setError('Write at least 10 characters.')
    if (!name.trim()) return setError('Add the name to show with your review.')
    setBusy(true)
    setProgress(0)
    try {
      const files = [...images, ...(video ? [video] : [])]
      let media: {key: string; type: string; size: number}[] = []
      if (files.length) {
        const res = await fetch('/api/reviews/upload', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({slug, files: files.map((f) => ({type: f.type, size: f.size}))})})
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error ?? 'server_error')
        const uploads = data.uploads as {key: string; url: string}[]
        const total = files.reduce((n, f) => n + f.size, 0)
        const sent = new Array<number>(files.length).fill(0)
        await Promise.all(uploads.map((u, i) => putFile(u.url, files[i], (loaded) => {
          sent[i] = loaded
          setProgress(Math.round((sent.reduce((a, b) => a + b, 0) / total) * 100))
        })))
        media = uploads.map((u, i) => ({key: u.key, type: files[i].type, size: files[i].size}))
      }
      const res = await fetch('/api/reviews', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({slug, rating, displayName: name, title: title || undefined, body: text, media})})
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'server_error')
      setDone(true)
      router.refresh()
    } catch (err) {
      setError(messages[(err as Error).message] ?? 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-[14px] bg-card p-6 sm:p-8">
        <h3 className="mb-1 font-heading text-[22px] font-bold">Thank you for your review</h3>
        <p className="text-body">It will appear on this page once it has been approved.</p>
      </div>
    )
  }

  const shown = hover || rating
  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-[14px] bg-card p-6 sm:p-8" noValidate>
      <h3 className="font-heading text-[22px] font-bold">Write a review</h3>

      <div>
        <div className="mb-1.5 text-sm font-semibold" id="rating-label">Your rating</div>
        <div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded border-0 bg-transparent p-0.5"
            >
              <Star size={30} aria-hidden="true" className={n <= shown ? 'fill-star text-star' : 'fill-transparent text-star/40'} />
            </button>
          ))}
        </div>
      </div>

      <label className={label}>Name shown with your review
        <input className={field} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={label}>Headline (optional)
        <input className={field} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" />
      </label>
      <label className={label}>Your review
        <textarea className={`${field} min-h-32 resize-y`} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="What did you make or learn? What would you tell another buyer?" />
        <span className="text-xs font-normal text-mute">{text.length} / 2000</span>
      </label>

      <div>
        <div className="mb-1.5 text-sm font-semibold">Photos or a video (optional)</div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => imageInput.current?.click()} disabled={busy || images.length >= LIMITS.images} className="inline-flex items-center gap-2 rounded-lg border border-field bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
            <Camera size={16} aria-hidden="true" />Add photos
          </button>
          <button type="button" onClick={() => videoInput.current?.click()} disabled={busy || !!video} className="inline-flex items-center gap-2 rounded-lg border border-field bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
            <Film size={16} aria-hidden="true" />Add a video
          </button>
        </div>
        <input ref={imageInput} type="file" multiple accept={Object.keys(IMAGE_TYPES).join(',')} className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = '' }} />
        <input ref={videoInput} type="file" accept={Object.keys(VIDEO_TYPES).join(',')} className="hidden" onChange={(e) => { addVideo(e.target.files); e.target.value = '' }} />
        <div className="mt-1.5 text-xs text-mute">Up to {LIMITS.images} photos (JPG, PNG or WebP, {mb(LIMITS.imageBytes)} MB each) and one video (MP4, WebM or MOV, {mb(LIMITS.videoBytes)} MB).</div>

        {(images.length > 0 || video) && (
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-3 p-0">
            {images.map((f, i) => (
              <li key={f.name + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previews[i]} alt={`Selected photo ${i + 1}`} className="size-20 rounded-lg object-cover" />
                <button type="button" aria-label={`Remove photo ${i + 1}`} disabled={busy} onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-0 bg-ink text-white"><X size={14} aria-hidden="true" /></button>
              </li>
            ))}
            {video && (
              <li className="relative flex h-20 items-center gap-2 rounded-lg bg-white px-3 pr-9 text-sm">
                <Film size={18} aria-hidden="true" />
                <span className="max-w-40 truncate">{video.name}</span>
                <button type="button" aria-label="Remove video" disabled={busy} onClick={() => setVideo(null)} className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-0 bg-ink text-white"><X size={14} aria-hidden="true" /></button>
              </li>
            )}
          </ul>
        )}
      </div>

      {busy && progress > 0 && <progress value={progress} max={100} className="h-2 w-full accent-accent" aria-label="Upload progress" />}
      {error && <div role="alert" className="text-sm text-[#B3261E]">{error}</div>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className={`${btnPrimary} border-0 disabled:cursor-not-allowed disabled:opacity-60`}>{busy ? (progress > 0 ? `Uploading ${progress}%` : 'Submitting...') : 'Submit review'}</button>
        <span className="text-sm text-mute">Reviews are checked before they appear.</span>
      </div>
    </form>
  )
}

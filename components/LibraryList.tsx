import Link from 'next/link'
import {Star} from 'lucide-react'
import Cover from './Cover'
import Reveal from './Reveal'
import {btnSm} from '@/lib/ui'
import type {Prod} from '@/lib/queries'

export default function LibraryList({guides}: {guides: Prod[]}) {
  return (
    <Reveal className="rounded-[14px] bg-card px-5 sm:px-7" y={16}>
      {guides.map((g) => {
        const meta = [`PDF${g.pages ? `, ${g.pages} pages` : ''}`, g.fileSizeMb ? `${g.fileSizeMb} MB` : null, g.version ? `Version ${g.version}` : null].filter(Boolean).join(' / ')
        return (
          <div key={g._id} className="flex flex-wrap items-center gap-5 border-b border-line py-6">
            <Cover size="lib" title={g.title} color={g.coverColor} image={g.coverUrl} />
            <div className="min-w-0 flex-[1_1_240px]">
              <strong className="text-lg">{g.title}</strong>
              <div className="text-sm text-mute">{meta}</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/guides/${g.slug}#reviews`} className="inline-flex items-center gap-1.5 text-sm font-semibold underline">
                <Star size={16} aria-hidden="true" />Write a review
              </Link>
              <a href={`/api/download/${g.slug}`} className={btnSm}>Download PDF</a>
            </div>
          </div>
        )
      })}
    </Reveal>
  )
}

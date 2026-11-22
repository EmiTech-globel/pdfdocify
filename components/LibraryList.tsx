import Cover from './Cover'
import {btnSm} from '@/lib/ui'
import type {Prod} from '@/lib/queries'

export default function LibraryList({guides}: {guides: Prod[]}) {
  return (
    <div className="rounded-[14px] bg-card px-5 sm:px-7">
      {guides.map((g) => {
        const meta = [`PDF${g.pages ? `, ${g.pages} pages` : ''}`, g.fileSizeMb ? `${g.fileSizeMb} MB` : null, g.version ? `Version ${g.version}` : null].filter(Boolean).join(' / ')
        return (
          <div key={g._id} className="flex flex-wrap items-center gap-5 border-b border-line py-6">
            <Cover size="lib" title={g.title} color={g.coverColor} image={g.coverUrl} />
            <div className="min-w-0 flex-[1_1_240px]">
              <strong className="text-lg">{g.title}</strong>
              <div className="text-sm text-mute">{meta}</div>
            </div>
            <a href={`/api/download/${g.slug}`} className={btnSm}>Download PDF</a>
          </div>
        )
      })}
    </div>
  )
}

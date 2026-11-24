import type {ReactNode} from 'react'

export const panel = 'flex scroll-mt-24 flex-col gap-[18px] rounded-[14px] bg-card p-6 sm:p-7'
export const fieldGrid = 'grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4'
export const saveBtn = 'w-full rounded-[10px] border-0 bg-accent px-6 py-3.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'

export function Panel({id, title, children}: {id: string; title: string; children: ReactNode}) {
  return (
    <section id={id} className={panel}>
      <h2 className="font-heading text-[22px] font-bold">{title}</h2>
      {children}
    </section>
  )
}

export function Notice({status}: {status: {ok: boolean; msg: string} | null}) {
  if (!status) return null
  return <div role={status.ok ? 'status' : 'alert'} className={`rounded-lg px-3.5 py-2.5 text-sm ${status.ok ? 'bg-white text-accent' : 'bg-white text-[#B3261E]'}`}>{status.msg}</div>
}

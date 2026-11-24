'use client'
import {useEffect, useState} from 'react'
import {useUser} from '@clerk/nextjs'
import {Notice, Panel, saveBtn} from './Panel'
import {clerkMessage} from './ProfileForm'

type Prefs = {receipts: boolean; updates: boolean; offers: boolean}
const defaults: Prefs = {receipts: true, updates: true, offers: false}
const rows: [keyof Prefs, string][] = [
  ['receipts', 'Order receipts and download links'],
  ['updates', 'Updates when a guide I own is revised'],
  ['offers', 'New guides and offers'],
]

export default function PrefsForm() {
  const {isLoaded, user} = useUser()
  const [prefs, setPrefs] = useState<Prefs>(defaults)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ok: boolean; msg: string} | null>(null)
  useEffect(() => {
    if (!user) return
    setPrefs({...defaults, ...((user.unsafeMetadata.emailPrefs as Partial<Prefs> | undefined) ?? {})})
  }, [isLoaded, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setStatus(null)
    setBusy(true)
    try {
      await user.update({unsafeMetadata: {...user.unsafeMetadata, emailPrefs: prefs}})
      setStatus({ok: true, msg: 'Your email preferences were saved.'})
    } catch (err) {
      setStatus({ok: false, msg: clerkMessage(err)})
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel id="prefs" title="Email preferences">
      <form onSubmit={save} className="flex flex-col gap-[18px]">
        {rows.map(([key, text]) => (
          <label key={key} className="flex items-center gap-2.5 text-[15px]">
            <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs({...prefs, [key]: e.target.checked})} disabled={!isLoaded} className="size-4 accent-accent" />
            {text}
          </label>
        ))}
        <Notice status={status} />
        <button type="submit" disabled={busy || !isLoaded} className={saveBtn}>{busy ? 'Saving...' : 'Save preferences'}</button>
      </form>
    </Panel>
  )
}

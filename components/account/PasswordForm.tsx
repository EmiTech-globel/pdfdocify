'use client'
import {useState} from 'react'
import {useUser} from '@clerk/nextjs'
import {field, label} from '@/lib/ui'
import {Notice, Panel, fieldGrid, saveBtn} from './Panel'
import {clerkMessage} from './ProfileForm'

export default function PasswordForm() {
  const {isLoaded, user} = useUser()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ok: boolean; msg: string} | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setStatus(null)
    if (next.length < 8) return setStatus({ok: false, msg: 'The new password must be at least 8 characters.'})
    setBusy(true)
    try {
      await user.updatePassword({currentPassword: current, newPassword: next, signOutOfOtherSessions: true})
      setCurrent(''); setNext('')
      setStatus({ok: true, msg: 'Password updated. Other devices were signed out.'})
    } catch (err) {
      setStatus({ok: false, msg: clerkMessage(err)})
    } finally {
      setBusy(false)
    }
  }

  if (isLoaded && user && !user.passwordEnabled) {
    return (
      <Panel id="security" title="Password">
        <p className="text-body">You sign in with Google, so there is no password to change here. Manage your sign-in from your Google account.</p>
      </Panel>
    )
  }

  return (
    <Panel id="security" title="Password">
      <form onSubmit={save} className="flex flex-col gap-[18px]" noValidate>
        <div className={fieldGrid}>
          <label className={label}>Current password<input className={field} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" disabled={!isLoaded} /></label>
          <label className={label}>New password<input className={field} type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" disabled={!isLoaded} /></label>
        </div>
        <Notice status={status} />
        <button type="submit" disabled={busy || !isLoaded || !current || !next} className={saveBtn}>{busy ? 'Updating...' : 'Update password'}</button>
      </form>
    </Panel>
  )
}

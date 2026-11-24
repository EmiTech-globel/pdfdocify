'use client'
import {useEffect, useState} from 'react'
import {useUser} from '@clerk/nextjs'
import {isClerkAPIResponseError} from '@clerk/nextjs/errors'
import {field, label} from '@/lib/ui'
import {Notice, Panel, fieldGrid, saveBtn} from './Panel'

export const clerkMessage = (e: unknown) =>
  isClerkAPIResponseError(e) ? e.errors[0]?.longMessage ?? e.errors[0]?.message ?? 'Something went wrong.' : 'Something went wrong. Try again.'

export default function ProfileForm() {
  const {isLoaded, user} = useUser()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [place, setPlace] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ok: boolean; msg: string} | null>(null)
  useEffect(() => {
    if (!user) return
    setName(user.fullName ?? '')
    setPhone(String(user.unsafeMetadata.phone ?? ''))
    setPlace(String(user.unsafeMetadata.location ?? ''))
  }, [isLoaded, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setStatus(null)
    if (!name.trim()) return setStatus({ok: false, msg: 'Enter your full name.'})
    if (name.trim().length > 80 || place.trim().length > 80) return setStatus({ok: false, msg: 'Name and location must be 80 characters or fewer.'})
    if (!/^[0-9+()\-\s]{0,20}$/.test(phone.trim())) return setStatus({ok: false, msg: 'Phone number can only contain digits, spaces, + ( ) and -.'})
    setBusy(true)
    try {
      const [first, ...rest] = name.trim().split(/\s+/)
      await user.update({firstName: first, lastName: rest.join(' '), unsafeMetadata: {...user.unsafeMetadata, phone: phone.trim(), location: place.trim()}})
      setStatus({ok: true, msg: 'Your details were saved.'})
    } catch (err) {
      setStatus({ok: false, msg: clerkMessage(err)})
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel id="profile" title="Profile details">
      <form onSubmit={save} className="flex flex-col gap-[18px]" noValidate>
        <div className={fieldGrid}>
          <label className={label}>Full name<input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" disabled={!isLoaded} /></label>
          <label className={label}>Email address<input className={`${field} opacity-70`} value={user?.primaryEmailAddress?.emailAddress ?? ''} readOnly placeholder="you@example.com" /><span className="text-xs font-normal text-mute">To change your email, contact us.</span></label>
          <label className={label}>Phone number<input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" autoComplete="tel" disabled={!isLoaded} /></label>
          <label className={label}>City and state<input className={field} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="For example, Port Harcourt, Rivers" autoComplete="address-level2" disabled={!isLoaded} /></label>
        </div>
        <Notice status={status} />
        <button type="submit" disabled={busy || !isLoaded} className={saveBtn}>{busy ? 'Saving...' : 'Save changes'}</button>
      </form>
    </Panel>
  )
}

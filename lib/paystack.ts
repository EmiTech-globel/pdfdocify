import 'server-only'
import crypto from 'node:crypto'
import {env} from './env'
const base = 'https://api.paystack.co'
const headers = () => ({Authorization: `Bearer ${env().PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json'})
export async function initialize(p: {email: string; amountKobo: number; reference: string; callbackUrl: string; metadata: Record<string, string>}) {
  const r = await fetch(`${base}/transaction/initialize`, {method: 'POST', headers: headers(), cache: 'no-store',
    body: JSON.stringify({email: p.email, amount: p.amountKobo, currency: 'NGN', reference: p.reference, callback_url: p.callbackUrl, metadata: p.metadata})})
  const j = await r.json()
  if (!r.ok || !j.status) throw new Error('paystack_init_failed')
  return j.data as {authorization_url: string}
}
export async function verify(reference: string) {
  const r = await fetch(`${base}/transaction/verify/${encodeURIComponent(reference)}`, {headers: headers(), cache: 'no-store'})
  const j = await r.json()
  if (!r.ok || !j.status) return null
  return j.data as {status: string; amount: number; currency: string}
}
export function validSignature(raw: string, sig: string | null) {
  if (!sig) return false
  const expected = Buffer.from(crypto.createHmac('sha512', env().PAYSTACK_SECRET_KEY).update(raw).digest('hex'))
  const given = Buffer.from(sig)
  return expected.length === given.length && crypto.timingSafeEqual(expected, given)
}

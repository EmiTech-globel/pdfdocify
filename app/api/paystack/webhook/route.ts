import {validSignature} from '@/lib/paystack'
import {fulfil} from '@/lib/fulfil'
export async function POST(req: Request) {
  const raw = await req.text() // raw body: the signature is computed over exact bytes
  if (!validSignature(raw, req.headers.get('x-paystack-signature'))) return new Response('invalid', {status: 401})
  let event: {event?: string; data?: {reference?: unknown}}
  try { event = JSON.parse(raw) } catch { return new Response('bad', {status: 400}) }
  if (event.event === 'charge.success' && typeof event.data?.reference === 'string') await fulfil(event.data.reference)
  return new Response('ok')
}

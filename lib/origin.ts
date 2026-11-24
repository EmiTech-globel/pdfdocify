import 'server-only'
import {env} from './env'

// CSRF guard for JSON APIs: the browser's Origin header must be this site. Tolerates a trailing slash in NEXT_PUBLIC_SITE_URL.
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return false
  try { return new URL(origin).origin === new URL(env().NEXT_PUBLIC_SITE_URL).origin } catch { return false }
}

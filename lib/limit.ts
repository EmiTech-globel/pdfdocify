import 'server-only'
import {Ratelimit} from '@upstash/ratelimit'
import {Redis} from '@upstash/redis'
const rl = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'store'}) : null
// Fails closed in production if Redis is not configured.
export async function allow(key: string) {
  if (!rl) return process.env.NODE_ENV !== 'production'
  return (await rl.limit(key)).success
}

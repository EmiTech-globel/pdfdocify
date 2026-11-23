import type {NextConfig} from 'next'
const dev = process.env.NODE_ENV === 'development'
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''} https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://img.clerk.com https://*.r2.cloudflarestorage.com",
  "media-src 'self' blob: https://*.r2.cloudflarestorage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.sanity.io wss://*.sanity.io https://api.paystack.co https://*.r2.cloudflarestorage.com",
  "frame-src https://challenges.cloudflare.com https://checkout.paystack.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'",
].join('; ')
const config: NextConfig = {
  allowedDevOrigins: ['http://localhost:3000.ngrok-free.app'],
  poweredByHeader: false,
  images: {remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}]},
  async headers() {
    return [{source: '/(.*)', headers: [
      {key: 'Content-Security-Policy', value: csp},
      {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'X-Frame-Options', value: 'DENY'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)'},
    ]}]
  },
}
export default config

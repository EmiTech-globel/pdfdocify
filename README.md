# PDFDocify

PDF guide store. Next.js 15 (App Router), Sanity, Clerk, Paystack, Neon Postgres, Cloudflare R2, Upstash, Zustand, Three.js (React Three Fiber) and GSAP.

## What you edit without touching code
Open `/studio` on your site and sign in with Sanity. Everything below is editable there; publishing updates the live site within seconds.

| Part of the site | Where in Studio |
|---|---|
| Store name, home headline, trust strip, footer, support contact | Site settings |
| Guides: title, price, pages, cover colour, chapters, FAQ, description, show or hide | Guide |
| Bundles: guides inside, price, featured on home page | Bundle |
| About, Terms, Refunds, Privacy, or any new page at `/your-slug` | Page |
| Sign-in methods (Google, email) | Clerk dashboard |

## Setup (about 45 minutes)
1. `npm install` then copy `.env.example` to `.env.local`.
2. **Sanity:** create a project, make the dataset **private**, create a Viewer token (`SANITY_API_READ_TOKEN`) and a Editor token for seeding. Add your site URL under API > CORS origins. Run `SANITY_WRITE_TOKEN=... npm run seed`.
3. **Sanity webhook:** in Manage > API > Webhooks, point to `https://YOUR_SITE/api/revalidate`, trigger on create, update and delete, and set a secret equal to `SANITY_REVALIDATE_SECRET`.
4. **Clerk:** create an application, turn on Google and email, copy the keys. For production, add your domain.
5. **Neon:** create a database and run `db/schema.sql` in its SQL editor. Set `DATABASE_URL`.
6. **R2:** create a **private** bucket and an API token limited to it. Upload each PDF to the path in that guide's "PDF path" field (the seed uses `guides/<slug>.pdf`).
7. **Paystack:** copy the secret key (test first). Set the webhook URL to `https://YOUR_SITE/api/paystack/webhook`.
8. **Upstash:** create a Redis database for rate limiting. Required in production; the app refuses requests without it.
9. `npm run dev`, then deploy to Vercel with the same environment variables.

## Security built in
- Prices are read from Sanity on the server at checkout; the browser's prices are never trusted.
- Paystack webhook is verified with HMAC SHA-512 over the raw body, then the transaction is re-verified with Paystack (amount and currency must match the order). Fulfilment is idempotent.
- PDFs live in a private R2 bucket. Downloads need a signed-in owner and use 60-second signed links. No public file URLs exist.
- Sanity dataset is private and read only on the server with a token; the PDF path never reaches the browser.
- Clerk handles passwords, sessions and Google sign-in; account and library pages are protected in middleware and again in each route.
- Checkout checks the request Origin, validates input with zod, and rate limits checkout and downloads per user.
- Security headers: HSTS, CSP, frame blocking, nosniff, referrer and permissions policies. Secrets are server-only and validated at startup.
- Database access is parameterised SQL only.

## Before going live
- Switch Paystack and Clerk to live keys and test one real payment end to end.
- Tighten the CSP: it allows inline scripts for Next and Clerk; move to nonces once stable, and add your Clerk custom domain.
- Add `/api/*` and `/studio` monitoring (Sentry) and enable Neon backups.
- Have the Terms, Refund and Privacy text reviewed for your situation.
- Not included yet: receipt emails (Resend), an admin orders view, discount codes, and a polished Three.js scene.

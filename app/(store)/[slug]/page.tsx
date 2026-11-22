import Link from 'next/link'
import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'
import {q} from '@/lib/sanity'
import {pageQ, settingsQ, type Page, type Settings} from '@/lib/queries'
import {introComponents, legalComponents} from '@/components/prose'
import {btnOutlineWhite, btnWhite, eyebrow, wrap} from '@/lib/ui'

// Serves About, Terms, Refunds, Privacy and any new page you add in Sanity.
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  return {title: (await q<Page>(pageQ, {slug: (await params).slug}))?.title}
}

const expect = [
  ['Practical, not padded', 'Every guide is short, structured and built around steps you can follow today.'],
  ['Updated regularly', 'When tools, prices or methods change, we update the guide and you get the new version free.'],
  ['Real support', 'Stuck on something? Reply to your receipt email and a real person answers.'],
]
const legalNav = [['Terms of service', 'terms'], ['Refund policy', 'refunds'], ['Privacy policy', 'privacy'], ['Contact support', 'about']]

export default async function ContentPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const [page, s] = await Promise.all([q<Page>(pageQ, {slug}), q<Settings>(settingsQ)])
  if (!page) notFound()
  const updated = new Date(page._updatedAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})

  if (slug === 'about') {
    const whatsapp = s?.whatsapp?.replace(/\D/g, '')
    return (
      <>
        <section className={`${wrap} flex flex-wrap items-center gap-12 pb-12 pt-10 sm:pt-[72px]`}>
          <div className="flex max-w-[760px] flex-[1_1_440px] flex-col gap-[18px]">
            <div className={eyebrow}>About</div>
            <h1 className="font-heading text-[clamp(34px,5vw,50px)] font-bold leading-[1.06] tracking-[-0.025em]">Guides written by people who do the work</h1>
            {page.body && <div className="flex flex-col gap-3"><PortableText value={page.body} components={introComponents} /></div>}
          </div>
        </section>

        <section className={`${wrap} pb-10 pt-6`}>
          <h2 className="mb-6 font-heading text-[32px] font-bold">What you can expect</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-6">
            {expect.map(([t, d]) => (
              <div key={t} className="rounded-[14px] bg-card p-6 sm:p-7">
                <h3 className="mb-2 font-heading text-[21px] font-bold">{t}</h3>
                <p className="text-[15px] text-body">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${wrap} py-6`}>
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-[20px] bg-accent p-8 text-white sm:p-11">
            <div className="flex-[1_1_320px]">
              <h2 className="mb-2 font-heading text-[30px] font-bold">Contact and support</h2>
              <p className="text-accent-soft">Reach us by email or WhatsApp. We reply within 24 hours on working days. Not happy with a guide? Ask for a refund within 7 days.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {s?.supportEmail && <a href={`mailto:${s.supportEmail}`} className={btnWhite}>Email us</a>}
              {whatsapp && <a href={`https://wa.me/${whatsapp}`} className={s?.supportEmail ? btnOutlineWhite : btnWhite}>WhatsApp</a>}
              <Link href="/#guides" className={s?.supportEmail || whatsapp ? btnOutlineWhite : btnWhite}>Browse the guides</Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className={`${wrap} pb-6 pt-10 sm:pt-14`}>
        <div className={`${eyebrow} mb-3`}>Legal</div>
        <h1 className="mb-2 font-heading text-[clamp(32px,5vw,46px)] font-bold tracking-[-0.025em]">{page.title}</h1>
        <div className="text-[15px] text-mute">Last updated: {updated}</div>
      </section>
      <section className={`${wrap} flex flex-wrap items-start gap-10 pb-14 pt-4`}>
        <nav aria-label="Legal" className="flex flex-[1_1_220px] flex-col gap-1">
          {legalNav.map(([label, href]) => (
            <Link key={href} href={`/${href}`} aria-current={slug === href ? 'page' : undefined} className={`rounded-lg px-4 py-3 no-underline ${slug === href ? 'bg-card font-semibold' : 'font-medium'}`}>{label}</Link>
          ))}
        </nav>
        <div className="flex-[3_1_520px] rounded-[14px] bg-card px-5 py-3 sm:px-9">
          {page.body && <PortableText value={page.body} components={legalComponents} />}
        </div>
      </section>
    </>
  )
}

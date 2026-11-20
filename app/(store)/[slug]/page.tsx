import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'
import {q} from '@/lib/sanity'
import {pageQ, type Page} from '@/lib/queries'
// Serves About, Terms, Refunds, Privacy and any new page you add in Sanity.
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  return {title: (await q<Page>(pageQ, {slug: (await params).slug}))?.title}
}
export default async function ContentPage({params}: {params: Promise<{slug: string}>}) {
  const page = await q<Page>(pageQ, {slug: (await params).slug})
  if (!page) notFound()
  return (
    <section className="wrap prose">
      <h1 style={{fontSize: 44, marginBottom: 8}}>{page.title}</h1>
      <p className="mute">Last updated {new Date(page._updatedAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
      {page.body && <PortableText value={page.body} />}
    </section>
  )
}

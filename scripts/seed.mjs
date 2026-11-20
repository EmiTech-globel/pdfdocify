// Loads the starter content into Sanity. Run once: SANITY_WRITE_TOKEN=... npm run seed
import {createClient} from '@sanity/client'
const c = createClient({projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', token: process.env.SANITY_WRITE_TOKEN, apiVersion: '2025-01-01', useCdn: false})
let k = 0
const key = () => 'k' + k++
const block = (t) => ({_type: 'block', _key: key(), style: 'normal', children: [{_type: 'span', _key: key(), text: t, marks: []}]})
const tx = c.transaction()
tx.createOrReplace({_id: 'siteSettings', _type: 'siteSettings', name: 'Trixpress', tagline: 'Digital guides, instant download',
  heroTitle: 'Practical guides for designers, developers and students who want results',
  heroSubtitle: 'Short, no-fluff PDF guides written by working creatives and engineers in Nigeria. Pay once, download instantly, keep forever.',
  trust: ['Instant PDF delivery', 'Secure checkout', 'Free updates', 'Prices in Naira'], footerNote: 'Trixpress. Instant PDF delivery.'})
const guides = [
  ['logo-design-process', 'The Logo Design Process', 'Design a logo from brief to final files.', 4500, 64, 'Design', '#0E1726'],
  ['freelance-design-pricing', 'Freelance Design Pricing & Clients', 'Set your rates and win better clients.', 3500, 48, 'Business', '#6B63C9'],
  ['portfolio-that-gets-you-hired', 'Portfolio That Gets You Hired', 'Present your work so clients say yes.', 3000, 42, 'Career', '#14665A'],
  ['build-your-first-full-stack-app', 'Build Your First Full-Stack App', 'Go from idea to a live web and mobile app.', 6000, 92, 'Development', '#7A2E4D'],
  ['hnd-engineering-report-writing', 'HND Engineering Report Writing', 'Write clear, well-formatted lab and project reports.', 2500, 36, 'Student life', '#3B3F9E'],
  ['study-smart-technical-courses', 'Study Smart for Technical Courses', 'Plan revision and get more from every study hour.', 2000, 30, 'Student life', '#8A5A12'],
]
guides.forEach(([slug, title, summary, price, pages, category, coverColor], i) => tx.createOrReplace({
  _id: 'product-' + slug, _type: 'product', title, slug: {_type: 'slug', current: slug}, summary, price, pages, category, coverColor,
  version: '1.0', sort: i + 1, active: true, fileKey: `guides/${slug}.pdf`,
  ...(slug === 'freelance-design-pricing' ? {chapters: [
    {_key: key(), title: 'Work out your rates', blurb: 'Calculate hourly and project rates that cover costs, time and profit.'},
    {_key: key(), title: 'Write proposals that win', blurb: 'A proposal structure you can reuse for logo, branding and social media work.'},
    {_key: key(), title: 'Contracts, deposits and getting paid', blurb: 'Clear terms, milestone payments and polite payment reminders.'},
    {_key: key(), title: 'Bonus: templates and checklists', blurb: 'Editable quote, contract and invoice templates.'}],
    faq: [{_key: key(), q: 'How do I get the PDF?', a: 'You get an instant download link after payment, and it stays in My library.'},
      {_key: key(), q: 'Can I get a refund?', a: 'Yes. Contact us within 7 days of purchase. See the refund policy.'}]} : {})}))
const bundles = [
  ['designer-starter', 'Designer Starter', 'For designers starting out: build the work, price it right and show it off.', 8500, true, [0, 1, 2]],
  ['engineering-student-pack', 'Engineering Student Pack', 'For engineering students who code: ship projects, write clean reports and study smarter.', 7900, false, [3, 4, 5]],
  ['creative-developer', 'Creative Developer', 'For creatives who build: design the brand, build the app and present it well.', 9900, false, [2, 0, 3]],
]
bundles.forEach(([slug, title, summary, price, featured, idx]) => tx.createOrReplace({_id: 'bundle-' + slug, _type: 'bundle', title, slug: {_type: 'slug', current: slug}, summary, price, featured, active: true,
  products: idx.map((i) => ({_type: 'reference', _key: key(), _ref: 'product-' + guides[i][0]}))}))
const pages = {
  about: ['About', ['Trixpress is the publishing arm of TrixStudio, a design and software studio in Nigeria. Every guide comes from real projects, real clients and real classrooms.', 'Reach us by email or WhatsApp. We reply within 24 hours on working days. Not happy with a guide? Ask for a refund within 7 days.']],
  terms: ['Terms of service', ['Using the guides: Trixpress sells digital PDF guides for personal learning and professional use. By buying or downloading a guide you agree to these terms.', 'Licence: each purchase gives one person a personal, non-transferable licence to read, print and use the guide. You may not resell, share, upload or distribute the PDF. Group licences are available on request.', 'Payments: prices are shown in Nigerian Naira (NGN). Payments are processed securely by our payment provider, and we do not store your card details.', 'Intellectual property: all content, templates and designs remain the property of Trixpress. Templates may be used in your own client work, but not resold as templates.', 'Liability: guides are educational and results depend on your effort and circumstances. To the extent allowed by law, Trixpress is not liable for losses arising from the use of a guide.']],
  refunds: ['Refund policy', ['We want you to be happy with every guide. If it is not what you expected, you can ask for a refund within 7 days of purchase.', 'Contact us with your order number and email address and tell us briefly what did not work for you. We reply within 24 hours on working days.', 'Approved refunds go back to your original payment method, and your bank may take several working days to show it.', 'Refunds are not available after 7 days or where a guide was shared with others. If a file is damaged or will not open, we will replace it free of charge.']],
  privacy: ['Privacy policy', ['We collect your name, email address and order details when you buy a guide, plus basic usage data to keep the site working.', 'We use your details to process orders, deliver your downloads, provide support and send important updates about your purchases. We only send marketing emails if you opt in.', 'Card and bank details are handled by our payment provider and are never stored on our servers.', 'Under the Nigeria Data Protection Act 2023 you can ask to see, correct or delete your personal data, or object to certain uses of it.']],
}
Object.entries(pages).forEach(([slug, [title, paras]]) => tx.createOrReplace({_id: 'page-' + slug, _type: 'page', title, slug: {_type: 'slug', current: slug}, body: paras.map(block)}))
await tx.commit()
console.log('Seeded: settings, 6 guides, 3 bundles, 4 pages')

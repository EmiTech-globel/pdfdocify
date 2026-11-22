// Fills Sanity with the Trixpress catalogue.
//   node --env-file=.env.local scripts/seed.mjs                 fill gaps only; never overwrites what you edited in Studio
//   node --env-file=.env.local scripts/seed.mjs --force         also overwrite content fields (title, headline, summary, body, chapters, faq, pages, size, author)
//   node --env-file=.env.local scripts/seed.mjs --clean-samples delete the old sample design guides and bundles
//   node --env-file=.env.local scripts/seed.mjs --pages         reset About, Terms, Refunds and Privacy to the numbered-section text (replaces your edits to those four pages)
// Commercial fields (price, fileKey, coverColor, sort, active, slug) are only ever set when missing.
import {createClient} from '@sanity/client'

const force = process.argv.includes('--force')
const cleanSamples = process.argv.includes('--clean-samples')
const resetPages = process.argv.includes('--pages')
const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
})

const para = (slug, i, text) => ({_type: 'block', _key: `${slug}-b${i}`, style: 'normal', markDefs: [], children: [{_type: 'span', _key: `${slug}-s${i}`, text, marks: []}]})
const items = (slug, kind, rows) => rows.map((r, i) => ({_key: `${slug}-${kind}${i}`, ...r}))

const commonFaq = [
  {q: 'How do I get the PDF?', a: 'You get an instant download link after payment, and the guide stays in My library so you can download it again any time.'},
  {q: 'Can I get a refund?', a: 'Yes. If a guide is not what you expected, contact us within 7 days of purchase. See the refund policy for details.'},
  {q: 'Is there a licence for teams?', a: 'Each purchase is for one person. For group or classroom copies, contact us about a group licence.'},
]

// Prices are proposals, edit them here or in Studio. Existing prices in Studio are never overwritten.
const guides = [
  {
    slug: 'how-to-paint-on-stone', matchTitle: 'how to paint on stone', sort: 1, price: 3500, coverColor: '#0E1726',
    title: 'How to Paint on Stone', category: 'Craft', pages: 56, fileSizeMb: 0.9, version: '1.0',
    headline: 'Learn stone painting step by step, from your first stone to finished gifts',
    summary: "A complete beginner's guide to stone painting, with four step-by-step projects.",
    body: [
      'Stone painting turns ordinary stones into keepsakes, gifts and small works of art. You do not need art training or expensive tools: a few smooth stones, acrylic paints and some patience are enough to start.',
      'This guide takes you from choosing and preparing stones, through brush work, dot painting, stencils, blending and colour mixing, to four complete projects and the sealing step that makes your work last.',
    ],
    chapters: [
      ['Introduction', 'What stone painting is and why it suits complete beginners.'],
      ['Essential tools and materials', 'The ten must-have supplies, plus indoor and outdoor workspace setup.'],
      ['Stone preparation', 'How to choose, wash, dry, sand and prime stones, and how texture affects your paint.'],
      ['Stone painting techniques', 'Brush strokes and filling, dot painting, stencils, blending and shading, and the common beginner mistakes.'],
      ['Color confidence', 'Colour basics, beginner-friendly combinations, mixing tips and test swatching.'],
      ['Project 1: Happy Mandala Pebble', 'A dot-painted mandala that teaches symmetry and colour coordination.'],
      ['Project 2: Cute Animal Faces', 'Cats, dogs, bears, owls and frogs using simple shapes and paint pens.'],
      ['Project 3: Inspirational Word Stones', 'Lettering, layout and finishing for meaningful gift stones.'],
      ['Project 4: Simple Landscape Stone', 'Skies, hills and silhouettes on a miniature scene.'],
      ['Sealing and finishing your artwork', 'Spray, brush-on and resin sealers, drying and curing times.'],
      ['Beyond the basics', 'Creative challenges, learning from other artists, selling your work and spreading kindness.'],
    ],
    faq: [
      {q: 'Do I need art experience?', a: 'No. The guide is written for complete beginners and starts with preparing stones and basic brush strokes.'},
      {q: 'What do I need to start?', a: 'Smooth stones, acrylic paints, a few brushes, a sealer and a pencil or chalk. Chapter 2 lists every item and the optional extras.'},
    ],
  },
  {
    slug: 'complete-needle-tatting-guide', matchTitle: 'the complete needle tatting guide', sort: 2, price: 7500, coverColor: '#7A2E4D',
    title: 'The Complete Needle Tatting Guide', author: 'Patricia Macdonald', category: 'Craft', pages: 140, fileSizeMb: 2.3, version: '1.0',
    headline: 'Go from simple knots to timeless lace with a needle and thread',
    summary: 'A complete guide to needle tatting, from core knots to bookmarks, edgings, jewelry, ornaments and a layered doily.',
    body: [
      'Needle tatting is lace-making with a needle, thread and the rhythm of your hands. The stitches are formed around the needle and slid onto the thread, which makes the craft easier to learn and far more forgiving than the shuttle method.',
      'This guide teaches the language of tatting and the core techniques first, then builds your skills through six projects, from a picot lace bookmark to a multi-round doily, and finishes with troubleshooting.',
    ],
    chapters: [
      ['Introduction to needle tatting', 'The craft, its history, and how needle tatting differs from shuttle tatting.'],
      ['Tools, materials and setup', 'The needles and threads you need and how to set up your hands and workspace.'],
      ['The language of tatting and foundation core techniques', 'Rings, chains, picots, joins and the double stitch, the building blocks of every pattern.'],
      ['Bookmark with picot lace', 'A first project small enough to finish in one sitting.'],
      ['Lace edging for handkerchief or linen', 'A traditional repeating edging for handkerchiefs, napkins and linens.'],
      ['Floral motif necklace', 'Take tatting into wearable jewelry with a floral motif.'],
      ['Snowflake ornaments', 'Symmetrical tatted snowflakes for decorations and gifts.'],
      ['Doily of layers', 'A multi-round doily that brings together tension, symmetry and pattern reading.'],
      ['Decorative trim on clothing', 'Use tatting as embellishment on clothing, accessories and home textiles.'],
      ['General troubleshooting and perfecting your craft', 'Fix tangles, twisted joins and tension problems, and refine your work.'],
    ],
    faq: [
      {q: 'Is this suitable for beginners?', a: 'Yes. It starts with tools, setup and the core techniques before moving on to projects.'},
      {q: 'What is the difference from shuttle tatting?', a: 'Needle tatting forms the stitches around a needle instead of a shuttle, which gives you more control and makes mistakes easier to undo.'},
    ],
  },
  {
    slug: 'shuttle-tatting-for-beginners', matchTitle: 'shuttle tatting for beginners', sort: 3, price: 4000, coverColor: '#14665A',
    title: 'Shuttle Tatting for Beginners', author: 'Katie Vigil', category: 'Craft', pages: 64, fileSizeMb: 0.7, version: '1.0',
    headline: 'Learn traditional lace-making with a shuttle, one knot at a time',
    summary: 'A step-by-step beginner guide to shuttle tatting, with a bookmark, flower coasters and a decorative edging.',
    body: [
      'Shuttle tatting is a traditional form of hand lace-making that uses a small shuttle and a single thread. It is quiet, portable work, and all you need to begin is a shuttle, some thread and your hands.',
      'This guide covers the tools, winding your shuttle, the double stitch and the rings, chains, picots and joins that every pattern is built from, then walks you through three projects.',
    ],
    chapters: [
      ['An introduction to shuttle tatting', 'What shuttle tatting is, why people love it, and a short history of the craft.'],
      ['Essential tools and materials needed', 'The shuttle, thread and supplies you need to get going.'],
      ['First steps with the shuttle', 'Winding the shuttle, holding the thread and making your first double stitches.'],
      ['Core techniques of shuttle tatting', 'Rings, chains, picots and joins, and how to read a pattern.'],
      ['Classic shuttle tatted bookmark', 'A beginner project that practises every core technique.'],
      ['Lacy flower coasters', 'A round, flower-shaped coaster using rings, chains, picots and joins.'],
      ['Decorative edging', 'A repeating edging for handkerchiefs, towels, collars and bookmarks.'],
      ['Growing your skills', 'Working with multiple threads and choosing patterns that stretch you.'],
    ],
    faq: [
      {q: 'Do I need any experience?', a: 'No. The guide is written for beginners and starts with the tools and your first stitches.'},
      {q: 'What do I need to start?', a: 'A shuttle, some thread and your hands. Chapter 2 covers the tools and materials in detail.'},
    ],
  },
  {
    slug: 'wire-wrapped-jewelry', matchTitle: 'wire wrapped jewelry', sort: 4, price: 5500, coverColor: '#8A5A12',
    title: 'Wire Wrapped Jewelry', author: 'Rachael Mobley', category: 'Craft', pages: 87, fileSizeMb: 1.7, version: '1.0',
    headline: 'Turn wire and beads into jewelry you can wear and sell',
    summary: 'Step-by-step wire wrapping projects, from simple beaded earrings to a double-loop pendant frame and a hair pin.',
    body: [
      'Wire wrapping needs no heat, glue or heavy machinery: you shape jewelry by bending, twisting and wrapping wire around beads, stones and itself. A few tools and a handful of materials are enough to start.',
      'This guide is for beginners who want a low-cost creative hobby, hobbyists refining their technique, artists adding a new medium, and anyone who wants to sell handmade jewelry. It covers tools and wires, core techniques, seven projects and how to finish and care for your work.',
    ],
    chapters: [
      ['Introduction to wire wrapping', 'What wire wrapping is, why it works, and who this guide is for.'],
      ['Essential tools and materials', 'The pliers, wires and supporting materials you will use in every project.'],
      ['Core techniques', 'Making loops and the other foundational moves, with practice exercises.'],
      ['Project 1: Simple beaded earrings', 'Classic drop earrings that practise loops and wraps.'],
      ['Project 2: Basic spiral ring', 'Shape wire into a wearable ring and learn to size it around a mandrel.'],
      ['Project 3: Charm pendant with a single stone', 'Turn one bead into a pendant that also works as a charm.'],
      ['Project 4: Wire-wrapped bracelet with beads', 'Connect beads with wrapped loops into a sturdy, flexible bracelet.'],
      ['Project 5: Wire-wrapped hoop earrings', 'Build a hoop frame and decorate it with small beads.'],
      ['Project 6: Double-loop pendant frame', 'A stronger frame for larger beads and focal stones.'],
      ['Project 7: Wire-wrapped hair pin', 'Combine frame building, binding and decorative wrapping.'],
      ['Finishing and care', 'Clean edges, polished wire, secure wraps, and how to care for finished pieces.'],
    ],
    faq: [
      {q: 'Is this suitable for beginners?', a: 'Yes. It starts with tools, materials and core techniques before the projects, which get progressively harder.'},
      {q: 'What do I need to start?', a: 'Basic jewelry pliers, wire and beads. Chapter 2 explains each tool and how to choose wire.'},
    ],
  },
]

const bundles = [
  {slug: 'tatting-collection', title: 'Tatting Collection', summary: 'Learn both traditions of lace-making: the shuttle and the needle.', price: 8900, featured: false, guides: ['shuttle-tatting-for-beginners', 'complete-needle-tatting-guide']},
  {slug: 'maker-starter', title: 'Maker Starter', summary: 'Two hands-on crafts with a low start-up cost: paint stones and wrap wire jewelry.', price: 6900, featured: false, guides: ['how-to-paint-on-stone', 'wire-wrapped-jewelry']},
  {slug: 'complete-craft-library', title: 'Complete Craft Library', summary: 'All four guides: stone painting, shuttle tatting, needle tatting and wire-wrapped jewelry.', price: 15900, featured: true, guides: ['how-to-paint-on-stone', 'shuttle-tatting-for-beginners', 'complete-needle-tatting-guide', 'wire-wrapped-jewelry']},
]

const pages = {
  about: ['About', [[null, 'We are the publishing arm of TrixStudio, a design and software studio in Nigeria. Our founder is a graphic designer, full-stack developer and engineering student who also teaches design. Every guide comes from real projects, real clients and real classrooms.']]],
  terms: ['Terms of service', [
    ['1. Using the guides', 'We sell digital PDF guides for personal learning and professional use. By buying or downloading a guide you agree to these terms.'],
    ['2. Licence and permitted use', 'Each purchase gives one person a personal, non-transferable licence to read, print and use the guide. You may not resell, share, upload or distribute the PDF. Group licences are available on request.'],
    ['3. Payments and pricing', 'Prices are shown in Nigerian Naira (NGN). Payments are processed securely by our payment provider, and we do not store your card details.'],
    ['4. Intellectual property', 'All content, templates and designs in our guides remain our property. Templates may be used in your own client work, but not resold as templates.'],
    ['5. Limits of liability', 'Guides are educational and results depend on your effort and circumstances. To the extent allowed by law, we are not liable for losses arising from the use of a guide.'],
    ['6. Contact', 'Questions about these terms? Reach us through the Contact page and we will reply within 24 hours on working days.'],
  ]],
  refunds: ['Refund policy', [
    ['1. Our promise', 'We want you to be happy with every guide. If it is not what you expected, you can ask for a refund within 7 days of purchase.'],
    ['2. Who is eligible', 'Refunds are available for guides and bundles when you contact us within 7 days of buying. We expect reasonable use, for example that the file has not been shared.'],
    ['3. How to request a refund', 'Contact us through the Contact page with your order number and email address, and tell us briefly what did not work for you.'],
    ['4. Timeframe', 'We reply within 24 hours on working days. Approved refunds go back to your original payment method, and your bank may take several working days to show it.'],
    ['5. Exceptions', 'Refunds are not available after 7 days or where a guide was shared with others. If a file is damaged or will not open, we will replace it free of charge.'],
  ]],
  privacy: ['Privacy policy', [
    ['1. What we collect', 'We collect your name, email address and order details when you buy a guide, plus basic usage data to keep the site working.'],
    ['2. How we use it', 'We use your details to process orders, deliver your downloads, provide support and send important updates about your purchases. We only send marketing emails if you opt in.'],
    ['3. Payment data', 'Card and bank details are handled by our payment provider and are never stored on our servers.'],
    ['4. Cookies and analytics', 'We use essential cookies to run the store and, where you agree, analytics cookies to understand how the site is used.'],
    ['5. Your rights', 'Under the Nigeria Data Protection Act 2023 you can ask to see, correct or delete your personal data, or object to certain uses of it.'],
    ['6. Contact', 'To use these rights or ask about privacy, contact us through the Contact page.'],
  ]],
}

const apply = (tx, id, commercial, content) => {
  tx.patch(id, (p) => p.setIfMissing(commercial))
  tx.patch(id, (p) => (force ? p.set(content) : p.setIfMissing(content)))
}

const existing = await c.fetch(`*[_type=="product"]{_id,title,"slug":slug.current}`)
const idFor = new Map()
const tx = c.transaction()

tx.createIfNotExists({_id: 'siteSettings', _type: 'siteSettings', name: 'Trixpress', tagline: 'Digital guides, instant download', heroTitle: 'Practical PDF guides for every goal', heroSubtitle: 'Short, clear, step-by-step guides on the topics you care about. Pay once, download instantly, keep forever.', trust: ['Instant PDF delivery', 'Secure checkout', 'Free updates', 'Prices in Naira'], footerNote: 'Trixpress. Instant PDF delivery.'})

for (const g of guides) {
  const found = existing.find((e) => e.slug === g.slug) || existing.find((e) => (e.title || '').trim().toLowerCase() === g.matchTitle)
  const id = found?._id || `product-${g.slug}`
  idFor.set(g.slug, id)
  tx.createIfNotExists({_id: id, _type: 'product', title: found?.title || g.title, slug: {_type: 'slug', current: found?.slug || g.slug}})
  apply(tx, id,
    {price: g.price, coverColor: g.coverColor, sort: g.sort, active: true, fileKey: `guides/${found?.slug || g.slug}.pdf`},
    {title: g.title, headline: g.headline, summary: g.summary, category: g.category, pages: g.pages, fileSizeMb: g.fileSizeMb, version: g.version,
      ...(g.author ? {author: g.author} : {}),
      body: g.body.map((t, i) => para(g.slug, i, t)),
      chapters: items(g.slug, 'c', g.chapters.map(([title, blurb]) => ({title, blurb}))),
      faq: items(g.slug, 'f', [...g.faq, ...commonFaq])})
}

for (const b of bundles) {
  const id = `bundle-${b.slug}`
  tx.createIfNotExists({_id: id, _type: 'bundle', title: b.title, slug: {_type: 'slug', current: b.slug}})
  apply(tx, id, {price: b.price, featured: b.featured, active: true},
    {title: b.title, summary: b.summary, products: b.guides.map((s) => ({_type: 'reference', _key: `${b.slug}-${s}`, _ref: idFor.get(s)}))})
}

for (const [slug, [title, sections]] of Object.entries(pages)) {
  const body = sections.flatMap(([heading, text], i) => [
    ...(heading ? [{_type: 'block', _key: `${slug}-h${i}`, style: 'h2', markDefs: [], children: [{_type: 'span', _key: `${slug}-hs${i}`, text: heading, marks: []}]}] : []),
    para(`${slug}-p`, i, text),
  ])
  const doc = {_id: `page-${slug}`, _type: 'page', title, slug: {_type: 'slug', current: slug}, body}
  if (resetPages) tx.createOrReplace(doc)
  else tx.createIfNotExists(doc)
}

if (cleanSamples) {
  ;['designer-starter', 'engineering-student-pack', 'creative-developer'].forEach((s) => tx.delete(`bundle-${s}`))
  ;['logo-design-process', 'freelance-design-pricing', 'portfolio-that-gets-you-hired', 'build-your-first-full-stack-app', 'hnd-engineering-report-writing', 'study-smart-technical-courses'].forEach((s) => tx.delete(`product-${s}`))
}

await tx.commit()
const out = await c.fetch(`*[_type=="product"&&active==true]|order(sort asc){title,price,pages,fileSizeMb,fileKey}`)
console.log(`Done (${force ? 'force' : 'gap fill'} mode). Upload each PDF to private storage at its fileKey:`)
console.table(out)

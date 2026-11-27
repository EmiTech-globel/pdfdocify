// One-off: turns each guide's old text category (like "Craft") into a Category document and links the guide to it.
//   node --env-file=.env.local scripts/migrate-categories.mjs          do it
//   node --env-file=.env.local scripts/migrate-categories.mjs --dry    only show what would change
// Safe to run again: guides that already link to a category are skipped.
import {createClient} from '@sanity/client'

const dry = process.argv.includes('--dry')
const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
  perspective: 'raw', // include unpublished drafts so they are migrated too
})

const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const docs = await c.fetch(`*[_type=="product"]{_id, category}`)
const old = docs.filter((d) => typeof d.category === 'string' && d.category.trim())
if (!old.length) { console.log('Nothing to migrate: no guide has a text category.'); process.exit(0) }

const names = [...new Set(old.map((d) => d.category.trim()))].sort((a, b) => a.localeCompare(b))
const existing = await c.fetch(`*[_type=="category"]{_id, "slug": slug.current}`)
const tx = c.transaction()
names.forEach((name, i) => {
  const id = `category-${slugOf(name)}`
  if (!existing.some((e) => e._id === id)) tx.createIfNotExists({_id: id, _type: 'category', title: name, slug: {_type: 'slug', current: slugOf(name)}, sort: existing.length + i + 1})
})
for (const d of old) tx.patch(d._id, {set: {category: {_type: 'reference', _ref: `category-${slugOf(d.category.trim())}`}}})

console.log(`${old.length} guide(s) -> categories: ${names.join(', ')}`)
if (dry) { console.log('Dry run, nothing written.'); process.exit(0) }
await tx.commit()
console.log('Done. Reorder or rename categories in the Studio under Category.')

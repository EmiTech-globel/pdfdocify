import {defineArrayMember, defineField, defineType} from 'sanity'
const slug = () => defineField({name: 'slug', type: 'slug', options: {source: 'title', maxLength: 80}, validation: (r) => r.required()})
const active = () => defineField({name: 'active', title: 'Visible on site', type: 'boolean', initialValue: true})
const body = () => defineField({name: 'body', type: 'array', of: [{type: 'block'}]})

const siteSettings = defineType({name: 'siteSettings', title: 'Site settings', type: 'document', fields: [
  defineField({name: 'name', title: 'Store name', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'tagline', type: 'string'}),
  defineField({name: 'heroTitle', title: 'Home page headline', type: 'string'}),
  defineField({name: 'heroSubtitle', title: 'Home page sub-headline', type: 'text', rows: 3}),
  defineField({name: 'trust', title: 'Trust strip items', type: 'array', of: [{type: 'string'}]}),
  defineField({name: 'supportEmail', type: 'string'}),
  defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string'}),
  defineField({name: 'footerNote', type: 'string'}),
]})

const product = defineType({name: 'product', title: 'Guide', type: 'document', fields: [
  defineField({name: 'title', type: 'string', validation: (r) => r.required()}), slug(),
  defineField({name: 'headline', title: 'Product page headline', description: 'Shown as the big heading on the guide page. Falls back to the title.', type: 'string'}),
  defineField({name: 'summary', type: 'text', rows: 2}),
  defineField({name: 'author', type: 'string'}),
  defineField({name: 'price', title: 'Price (NGN)', description: 'In naira. Decimals are fine, for example 7499.90.', type: 'number', validation: (r) => r.required().min(50).precision(2)}),
  defineField({name: 'pages', type: 'number'}),
  defineField({name: 'fileSizeMb', title: 'PDF size (MB)', type: 'number'}),
  defineField({name: 'category', type: 'string', description: 'Free text. Use identical spelling across guides.'}),
  defineField({name: 'coverColor', title: 'Cover colour (hex)', type: 'string', validation: (r) => r.regex(/^#[0-9A-Fa-f]{6}$/)}),
  defineField({name: 'coverImage', title: 'Cover image', type: 'image', options: {hotspot: true}}),
  defineField({name: 'version', type: 'string', initialValue: '1.0'}),
  defineField({name: 'sort', title: 'Sort order (low first)', type: 'number'}),
  defineField({name: 'fileKey', title: 'PDF path in private storage', description: 'For example guides/logo-design.pdf. Never a public link.', type: 'string', validation: (r) => r.required()}),
  body(),
  defineField({name: 'chapters', type: 'array', of: [defineArrayMember({type: 'object', fields: [{name: 'title', type: 'string'}, {name: 'blurb', type: 'string'}]})]}),
  defineField({name: 'faq', type: 'array', of: [defineArrayMember({type: 'object', fields: [{name: 'q', title: 'Question', type: 'string'}, {name: 'a', title: 'Answer', type: 'text', rows: 2}]})]}),
  active(),
]})

const bundle = defineType({name: 'bundle', title: 'Bundle', type: 'document', fields: [
  defineField({name: 'title', type: 'string', validation: (r) => r.required()}), slug(),
  defineField({name: 'summary', type: 'text', rows: 2}),
  defineField({name: 'products', title: 'Guides in this bundle', type: 'array', of: [{type: 'reference', to: [{type: 'product'}]}], validation: (r) => r.min(2)}),
  defineField({name: 'price', title: 'Bundle price (NGN)', description: 'In naira. Decimals are fine.', type: 'number', validation: (r) => r.required().min(50).precision(2)}),
  defineField({name: 'featured', title: 'Show on home page', type: 'boolean'}),
  active(),
]})

const page = defineType({name: 'page', title: 'Page (About, Terms, Refunds, Privacy)', type: 'document', fields: [
  defineField({name: 'title', type: 'string', validation: (r) => r.required()}), slug(), body(),
]})
export const schemaTypes = [siteSettings, product, bundle, page]

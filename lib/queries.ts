import type {PortableTextBlock} from 'next-sanity'
export type Settings = {name?: string; tagline?: string; heroTitle?: string; heroSubtitle?: string; trust?: string[]; supportEmail?: string; whatsapp?: string; footerNote?: string} | null
export type Prod = {_id: string; title: string; slug: string; summary?: string; price: number; pages?: number; category?: string; coverColor?: string; coverUrl?: string; version?: string; headline?: string; author?: string; fileSizeMb?: number}
export type ProdFull = Prod & {body?: PortableTextBlock[]; chapters?: {title: string; blurb: string}[]; faq?: {q: string; a: string}[]}
export type Bundle = {_id: string; title: string; slug: string; summary?: string; price: number; featured?: boolean; items: Prod[]}
export type Page = {title: string; body?: PortableTextBlock[]; _updatedAt: string} | null
const P = `_id,title,"slug":slug.current,summary,price,pages,category,coverColor,"coverUrl":coverImage.asset->url,version,headline,author,fileSizeMb`
export const settingsQ = `*[_type=="siteSettings"][0]{name,tagline,heroTitle,heroSubtitle,trust,supportEmail,whatsapp,footerNote}`
export const productsQ = `*[_type=="product"&&active==true]|order(coalesce(sort,999) asc,_createdAt desc){${P}}`
export const productQ = `*[_type=="product"&&active==true&&slug.current==$slug][0]{${P},body,chapters,faq}`
export const bundlesQ = `*[_type=="bundle"&&active==true]|order(featured desc,_createdAt asc){_id,title,"slug":slug.current,summary,price,featured,"items":products[]->{${P}}}`
export const pageQ = `*[_type=="page"&&slug.current==$slug][0]{title,body,_updatedAt}`
export const naira = (n: number) => '₦' + n.toLocaleString('en-NG')

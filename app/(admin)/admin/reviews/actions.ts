'use server'
import {auth} from '@clerk/nextjs/server'
import {revalidatePath} from 'next/cache'
import {db} from '@/lib/db'
import {isAdmin} from '@/lib/admin'
import {logAdmin} from '@/lib/admin-data'
import {deleteObject} from '@/lib/r2'

const uuid = /^[0-9a-f-]{36}$/

async function guard(formData: FormData) {
  const {userId} = await auth()
  if (!isAdmin(userId)) throw new Error('forbidden')
  const id = String(formData.get('id') ?? '')
  if (!uuid.test(id)) throw new Error('bad id')
  return {id, admin: userId as string}
}

export async function setReviewStatus(formData: FormData) {
  const {id, admin} = await guard(formData)
  const status = String(formData.get('status'))
  if (!['approved', 'rejected', 'pending'].includes(status)) throw new Error('bad status')
  const [row] = await db()`update reviews set status = ${status} where id = ${id} returning product_slug`
  await logAdmin(admin, `review_${status}`, id, {product: row?.product_slug ?? null})
  revalidatePath('/admin/reviews')
  if (row) revalidatePath(`/guides/${row.product_slug}`)
}

export async function deleteReview(formData: FormData) {
  const {id, admin} = await guard(formData)
  const sql = db()
  const media = await sql`select object_key from review_media where review_id = ${id}`
  await Promise.all(media.map((m) => deleteObject(m.object_key as string)))
  const [row] = await sql`delete from reviews where id = ${id} returning product_slug`
  await logAdmin(admin, 'review_deleted', id, {product: row?.product_slug ?? null, media: media.length})
  revalidatePath('/admin/reviews')
  if (row) revalidatePath(`/guides/${row.product_slug}`)
}

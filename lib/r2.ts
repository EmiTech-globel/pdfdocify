import 'server-only'
import {S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand, CopyObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {env} from './env'

let cached: S3Client | undefined
function client() {
  const e = env()
  return (cached ??= new S3Client({region: 'auto', endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY}}))
}

export function signedDownload(key: string, filename: string) {
  const cmd = new GetObjectCommand({Bucket: env().R2_BUCKET, Key: key, ResponseContentDisposition: `attachment; filename="${filename}"`})
  return getSignedUrl(client(), cmd, {expiresIn: 60})
}

// Review media: the browser uploads straight to R2 with a short-lived signed URL.
export function presignPut(key: string, contentType: string) {
  return getSignedUrl(client(), new PutObjectCommand({Bucket: env().R2_BUCKET, Key: key, ContentType: contentType}), {expiresIn: 600})
}
export function presignView(key: string, contentType: string) {
  const cmd = new GetObjectCommand({Bucket: env().R2_BUCKET, Key: key, ResponseContentType: contentType, ResponseContentDisposition: 'inline'})
  return getSignedUrl(client(), cmd, {expiresIn: 900})
}
export async function headObject(key: string): Promise<{size: number; type: string} | null> {
  try {
    const r = await client().send(new HeadObjectCommand({Bucket: env().R2_BUCKET, Key: key}))
    return {size: Number(r.ContentLength ?? 0), type: r.ContentType ?? ''}
  } catch { return null }
}
export async function deleteObject(key: string) {
  try { await client().send(new DeleteObjectCommand({Bucket: env().R2_BUCKET, Key: key})) } catch { /* already gone */ }
}
export async function moveObject(from: string, to: string) {
  const bucket = env().R2_BUCKET
  await client().send(new CopyObjectCommand({Bucket: bucket, CopySource: `${bucket}/${from}`, Key: to}))
  await deleteObject(from)
}

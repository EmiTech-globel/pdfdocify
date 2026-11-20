import 'server-only'
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {env} from './env'
export function signedDownload(key: string, filename: string) {
  const e = env()
  const client = new S3Client({region: 'auto', endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY}})
  const cmd = new GetObjectCommand({Bucket: e.R2_BUCKET, Key: key, ResponseContentDisposition: `attachment; filename="${filename}"`})
  return getSignedUrl(client, cmd, {expiresIn: 60})
}

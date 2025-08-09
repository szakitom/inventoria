import {
  S3Client as AWSClient,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const { S3_USER, S3_PASSWORD, S3_ENDPOINT, S3_PORT, S3_BUCKET } = process.env

if (!S3_USER || !S3_PASSWORD) {
  throw new Error('S3_USER and S3_PASSWORD must be defined')
}

export const bucket = S3_BUCKET || 'inventoria'

class S3Client {
  client: AWSClient
  constructor(config) {
    this.client = new AWSClient(config)
  }

  async presignUrl(key, fileType) {
    const params: PutObjectCommandInput = {
      Key: key,
      ContentType: fileType,
      Bucket: bucket,
      Metadata: { 'Content-Type': fileType },
    }
    const command = new PutObjectCommand(params)
    const url = await getSignedUrl(this.client, command, {
      expiresIn: 10 * 60, // 10 minutes
    })
    console.info(`🖼️ Presigned URL for ${key} created: ${url}`)
    const cleanURL = url.replace(
      `http://${S3_ENDPOINT || 'localhost'}:${S3_PORT || 9000}/${bucket}/`,
      `/s3/${bucket}/`
    )
    return cleanURL
  }
}

// TODO: periodically delete incomplete uploads

export default new S3Client({
  endpoint: `http://${S3_ENDPOINT || 'localhost'}:${S3_PORT || 9000}`,
  region: 'eu',
  credentials: {
    accessKeyId: S3_USER,
    secretAccessKey: S3_PASSWORD,
  },
  forcePathStyle: true, // Required for RustFS
})

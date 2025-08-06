import { Client as MinioClient } from 'minio'
import { S3Client as AWSClient, ListBucketsCommand } from '@aws-sdk/client-s3'

const { S3_USER, S3_PASSWORD, S3_ENDPOINT, S3_PORT, S3_BUCKET } = process.env

if (!S3_USER || !S3_PASSWORD) {
  throw new Error('S3_USER and S3_PASSWORD must be defined')
}

export const bucket = S3_BUCKET || 'inventoria'

const minioClient = new MinioClient({
  endPoint: S3_ENDPOINT || 'localhost',
  port: Number(S3_PORT) || 9000,
  useSSL: process.env.NODE_ENV === 'production' ? true : false,
  accessKey: S3_USER,
  secretKey: S3_PASSWORD,
})

const awsClient = new AWSClient({
  endpoint: `http://${S3_ENDPOINT || 'localhost'}:${S3_PORT || 9000}`,
  region: 'eu',
  credentials: {
    accessKeyId: S3_USER,
    secretAccessKey: S3_PASSWORD,
  },
  forcePathStyle: true, // Required for RustFS
})

// TODO: periodically delete incomplete uploads

const s3Client = awsClient

export default s3Client

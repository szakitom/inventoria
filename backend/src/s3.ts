import { Client } from 'minio'

const { S3_USER, S3_PASSWORD, S3_ENDPOINT, S3_PORT, S3_BUCKET } = process.env

export const bucket = S3_BUCKET || 'inventoria'

const s3Client = new Client({
  endPoint: S3_ENDPOINT || 'localhost',
  port: Number(S3_PORT) || 9000,
  useSSL: process.env.NODE_ENV === 'production' ? true : false,
  accessKey: S3_USER,
  secretKey: S3_PASSWORD,
})

// TODO: periodically delete incomplete uploads

export default s3Client

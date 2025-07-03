import { Client } from 'minio'

const { MINIO_USER, MINIO_PASSWORD, MINIO_ENDPOINT, MINIO_PORT, MINIO_BUCKET } =
  process.env

export const bucket = MINIO_BUCKET || 'inventoria'

const minioClient = new Client({
  endPoint: MINIO_ENDPOINT || 'localhost',
  port: Number(MINIO_PORT) || 9000,
  useSSL: process.env.NODE_ENV === 'production' ? true : false,
  accessKey: MINIO_USER,
  secretKey: MINIO_PASSWORD,
})

// TODO: periodically delete incomplete uploads

export default minioClient

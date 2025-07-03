import { Client } from 'minio'

const { MINIO_USER, MINIO_PASSWORD, MINIO_ENDPOINT, MINIO_PORT } = process.env

const minioClient = new Client({
  endPoint: MINIO_ENDPOINT || 'localhost',
  port: Number(MINIO_PORT) || 9000,
  useSSL: process.env.NODE_ENV === 'production' ? true : false,
  accessKey: MINIO_USER,
  secretKey: MINIO_PASSWORD,
})

export default minioClient

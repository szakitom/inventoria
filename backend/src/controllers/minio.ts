import { v4 as uuidv4 } from 'uuid'
import minioClient, { bucket } from '../minio'

export const presignURL = async (req, res, next) => {
  try {
    const uuid = uuidv4()
    const presignedUrl = await minioClient.presignedPutObject(
      bucket,
      uuid,
      10 * 60 // 10 minutes
    )
    res.json({ url: presignedUrl, uuid })
  } catch (err) {
    next(err)
  }
}

export const getFileURL = async (req, res, next) => {
  try {
    const { uuid } = req.params
    const fileUrl = await minioClient.presignedGetObject(
      bucket,
      uuid,
      60 * 60 // 1 hour
    )
    res.json({ url: fileUrl })
  } catch (err) {
    next(err)
  }
}

export const deleteFile = async (uuid) => {
  try {
    await minioClient.removeObject(bucket, uuid)
    console.info(`🗑️ Image ${uuid} deleted from MinIO`)
  } catch (err) {
    console.error(`⚠️ Failed to delete image ${uuid}`, err)
  }
}

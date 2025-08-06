import { v4 as uuidv4 } from 'uuid'
import s3Client, { bucket } from '../s3'

export const presignURL = async (req, res, next) => {
  try {
    const uuid = uuidv4()
    const presignedUrl = await s3Client.presignedPutObject(
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
    const fileUrl = await s3Client.presignedGetObject(
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
    await s3Client.removeObject(bucket, uuid)
    console.info(`🗑️ Image ${uuid} deleted from S3`)
  } catch (err) {
    console.error(`⚠️ Failed to delete image ${uuid}`, err)
  }
}

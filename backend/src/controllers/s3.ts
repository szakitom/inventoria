import { v4 as uuidv4 } from 'uuid'
import s3Client, { bucket } from '../s3'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'

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

export const getFiles = async (req, res, next) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
    })

    const response = await s3Client.send(command)

    if (response.Contents) {
      response.Contents.forEach((obj) => {
        console.log(`- ${obj.Key} (${obj.Size} bytes)`)
      })
    }
    console.log(response.Contents)
    return res.json(response.Contents || [])
  } catch (error) {
    console.error('Error listing objects:', error)
    next(error)
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

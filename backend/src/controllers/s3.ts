import mongoose from 'mongoose'
import S3Client from '../s3'

export const presignURL = async (req, res, next) => {
  try {
    const uuid = new mongoose.Types.ObjectId()
    const presignedUrl = await S3Client.presignUrl(uuid.toString(), 'image/png')
    res.json({ url: presignedUrl, uuid })
  } catch (err) {
    next(err)
  }
}

export const presignURLForId = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'ID is required' })
    }
    const presignedUrl = await S3Client.presignUrl(id, 'image/png')
    res.json({ url: presignedUrl, uuid: id })
  } catch (err) {
    next(err)
  }
}

export const deleteFile = async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    await S3Client.deleteFile(url)
    res.json({ message: 'File deleted successfully' })
  } catch (err) {
    next(err)
  }
}

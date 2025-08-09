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

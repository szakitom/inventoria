import { Router } from 'express'
import * as s3Controller from '../controllers/s3'

const router = Router()

router.get('/presign', s3Controller.presignURL)
router.delete('/', s3Controller.deleteFile)

export default router

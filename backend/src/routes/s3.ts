import { Router } from 'express'
import * as s3Controller from '../controllers/s3'

const router = Router()

router.get('/presign', s3Controller.presignURL)
router.get('/get/:filename', s3Controller.getFileURL)

export default router

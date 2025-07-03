import { Router } from 'express'
import * as minioController from '../controllers/minio'

const router = Router()

router.get('/presign', minioController.presignURL)
router.get('/get/:filename', minioController.getFileURL)

export default router

import { Router } from 'express'
import itemsRouter from './items'
import locationsRouter from './locations'
import offRouter from './off'
import s3Router from './s3'

const router = Router()

router.use('/items', itemsRouter)

router.use('/locations', locationsRouter)

router.use('/off', offRouter)

router.use('/s3', s3Router)

router.get('/heartbeat', (req, res) => {
  res.json({ connection: 'ok' })
})

export default router

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

router.get('/ip', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    headers: req.headers['x-forwarded-for'],
  })
})

export default router

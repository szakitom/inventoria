import { Router } from 'express'
import itemsRouter from './items'
import locationsRouter from './locations'
import offRouter from './off'

const router = Router()

router.use('/items', itemsRouter)

router.use('/locations', locationsRouter)

router.use('/off', offRouter)

router.get('/heartbeat', (req, res) => {
  res.json({ connection: 'ok' })
})

export default router

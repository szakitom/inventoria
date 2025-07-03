import { Router } from 'express'
import itemsRouter from './items'

const router = Router()

router.use('/items', itemsRouter)

router.get('/heartbeat', (req, res) => {
  res.json({ connection: 'ok' })
})

export default router

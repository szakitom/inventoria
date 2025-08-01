import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as itemsController from '../controllers/item'

const router = Router()

const productReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 90, // Limit to 90 requests per minute actual is 100
  message: { message: 'Too many requests, please try again later.' },
})

router.get('/', itemsController.getItems)
router.post('/', productReadLimiter, itemsController.createItem)
router.get('/:id', itemsController.getItem)
router.delete('/:id', itemsController.deleteItem)
router.put('/:id', productReadLimiter, itemsController.updateItem)
router.patch('/:id', itemsController.moveItem)
router.get('/search/:term', itemsController.searchItems)

export default router

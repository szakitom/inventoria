import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as openFoodFactsController from '../controllers/OpenFoodFacts'

const router = Router()

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2, // Limit to 8 requests per minute actual is 10
  message: { message: 'Too many search requests, please try again later.' },
})

router.get('/search/:term', searchLimiter, openFoodFactsController.search)

export default router

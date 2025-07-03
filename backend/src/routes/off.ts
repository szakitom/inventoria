import { Router } from 'express'
import * as openFoodFactsController from '../controllers/OpenFoodFacts'

const router = Router()

router.get('/search/:term', openFoodFactsController.search)

export default router

import { Router } from 'express'
import * as itemsController from '../controllers/items'

const router = Router()

router.get('/', itemsController.getItems)
router.post('/', itemsController.createItem)

export default router

import { Router } from 'express'
import * as itemsController from '../controllers/item'

const router = Router()

router.get('/', itemsController.getItems)
router.post('/', itemsController.createItem)
router.get('/:id', itemsController.getItem)
router.delete('/:id', itemsController.deleteItem)
router.put('/:id', itemsController.updateItem)
router.patch('/:id', itemsController.moveItem)
router.get('/search/:term', itemsController.searchItems)

export default router

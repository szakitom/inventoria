import { Router } from 'express'
import * as locationsController from '../controllers/location'

const router = Router()

router.post('/', locationsController.createLocation)
router.get('/', locationsController.getLocations)
router.get('/:id', locationsController.getLocation)

export default router

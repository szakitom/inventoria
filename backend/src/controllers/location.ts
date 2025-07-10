import mongoose, { Types } from 'mongoose'
import { Location, Shelf } from '../models'

export const createLocation = async (req, res, next) => {
  const session = await mongoose.startSession()
  try {
    const { name, count } = req.body

    if (!name || typeof count !== 'number' || count <= 0) {
      return res
        .status(400)
        .json({ error: 'Name and valid count are required' })
    }
    session.startTransaction()

    const location = await Location.create([{ name }], { session })
    const locationDoc = location[0]

    const shelves = await Promise.all(
      Array.from({ length: count }).map(async (_, i) => {
        const shelf = await Shelf.create(
          [
            {
              name: `Shelf ${i + 1}`,
              location: locationDoc._id,
            },
          ],
          { session }
        )
        return shelf[0]
      })
    )

    locationDoc.shelves = shelves.map((shelf) => shelf._id) as Types.ObjectId[]
    await locationDoc.save({ session })

    await session.commitTransaction()

    res.json({ location, shelves })
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction()
    }
    next(err)
  } finally {
    session.endSession()
  }
}

export const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find()
      .populate('shelves', 'name')
      .sort({ name: 1 })
    res.json(locations)
  } catch (err) {
    next(err)
  }
}

export const getLocation = async (req, res, next) => {
  try {
    const { id } = req.params
    const location = await Location.findById(id).populate('shelves')

    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }
    res.json(location)
  } catch (err) {
    next(err)
  }
}

export const getLocationShelf = async (req, res, next) => {
  try {
    const { id: location_id, shelf: shelf_id } = req.params
    const [location, shelf] = await Promise.all([
      Location.findById(location_id).select('name'),
      Shelf.findById(shelf_id).populate('items'),
    ])
    if (!shelf) {
      return res.status(404).json({ error: 'Shelf not found' })
    }
    res.json({ ...shelf.toJSON({ virtuals: true }), location })
  } catch (err) {
    next(err)
  }
}

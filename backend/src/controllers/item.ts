import mongoose from 'mongoose'
import { Temporal } from '@js-temporal/polyfill'
import { Item, Location, Shelf } from '../models'
import { getProduct } from './OpenFoodFacts'
import { deleteFile } from './minio'

export const getItems = async (req, res, next) => {
  // IDEA: cursor based pagination
  try {
    let sortOptions: { [key: string]: 1 | -1 } = { name: 1 }
    let limit = 10
    let page = 1
    let regex: RegExp | null = null
    if (req.query.sort) {
      sortOptions = getSortOptions(req.query.sort)
    }
    if (req.query.page) {
      page = parseInt(req.query.page as string, 10)
    }
    if (req.query.limit) {
      limit = parseInt(req.query.limit as string, 10)
    }
    if (req.query.search) {
      regex = new RegExp(req.query.search, 'i')
    }
    let baseQuery: any = {
      $or: [
        { name: regex },
        { barcode: regex },
        { 'openFoodFacts.product_name': regex },
      ],
    }
    if (req.query.locations) {
      let shelfIds
      if (req.query.shelves) {
        // If shelves are provided, filter by shelves in the selected locations
        shelfIds = req.query.shelves.split(',')
      } else {
        // Get shelves from the selected locations
        const locationIds = req.query.locations.split(',')
        const locations = await Location.find(
          { _id: { $in: locationIds } },
          'shelves'
        )
        shelfIds = locations.flatMap((loc) =>
          loc.shelves.map((s) => s.toString())
        )
      }

      baseQuery = {
        ...baseQuery,
        location: { $in: shelfIds },
      }
    }

    const query = Item.find(baseQuery)
      .collation({ locale: 'hu', strength: 2 })
      .sort(sortOptions)
      .populate({
        path: 'location',
        select: 'name',
        populate: {
          path: 'location',
          select: 'name type',
        },
      })
      .select('+openFoodFacts')

    if (limit !== 0) {
      query.limit(limit).skip((page - 1) * limit)
    }

    const [items, total] = await Promise.all([
      query,
      Item.countDocuments(baseQuery),
    ])
    res.json({
      items,
      total,
      pages: limit === 0 ? 1 : Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
}

export const searchItems = async (req, res, next) => {
  try {
    const { term } = req.params
    if (!term) {
      return res.status(400).json({ error: 'Search term is required' })
    }
    let sortOptions: { [key: string]: 1 | -1 } = { expiration: 1 }
    if (req.query.sort) {
      const { sort } = req.query
      sortOptions = getSortOptions(sort)
    }
    const regex = new RegExp(term, 'i')
    const items = await Item.find({
      $or: [
        { name: regex },
        { barcode: regex },
        { 'openFoodFacts.product_name': regex },
      ],
    }).sort(sortOptions)
    if (items.length === 0) {
      return res.status(404).json({ error: 'No items found' })
    }
    res.json(items)
  } catch (err) {
    next(err)
  }
}

export const getItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const item = await Item.findById(id).select('+openFoodFacts')
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    res.json(item)
  } catch (err) {
    next(err)
  }
}

export const createItem = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { barcode, location } = req.body
    let { expiration } = req.body
    if (expiration) {
      const date = new Date(expiration)
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'Invalid expiration date format. Please provide a valid date.',
        })
      }
      expiration = getFullDate({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      })
    }
    let offData
    if (barcode) {
      try {
        offData = await getProduct(barcode)
      } catch (error) {
        offData = null
      }
    }

    const item = await Item.create(
      [
        {
          ...req.body,
          expiration,
          openFoodFacts: offData,
          name: req.body.name || offData?.product_name || barcode,
        },
      ],
      { session }
    )
    await Shelf.findByIdAndUpdate(
      location,
      { $push: { items: item[0]._id } },
      { session }
    )
    await session.commitTransaction()
    res.json(item[0])
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction()
    }
    if (req.body?.image) {
      deleteFile(req.body.image)
    }
    next(err)
  } finally {
    session.endSession()
  }
}

export const deleteItem = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { id } = req.params
    const item = await Item.findByIdAndDelete(id, { session })
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    await Shelf.findByIdAndUpdate(
      item.location,
      { $pull: { items: item._id } },
      { session }
    )
    await session.commitTransaction()
    res.json({ message: 'Item deleted successfully' })
    if (item.image) {
      deleteFile(item.image)
    }
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction()
    }
    next(err)
  } finally {
    session.endSession()
  }
}

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params
    let { expiration } = req.body
    if (expiration) {
      const date = new Date(expiration)
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'Invalid expiration date format. Please provide a valid date.',
        })
      }
      expiration = getFullDate({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      })
    }
    const item = await Item.findByIdAndUpdate(
      id,
      { ...req.body, expiration },
      { new: true }
    )
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json(item)
  } catch (err) {
    next(err)
  }
}

export const moveItem = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { id } = req.params
    const { location } = req.body
    const oldItem = await Item.findById(id)
    if (!oldItem) {
      return res.status(404).json({ error: 'Item not found' })
    }
    if (oldItem.location.toString() === location) {
      return res.status(400).json({ error: 'Item is already in this location' })
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { location },
      { new: true, session }
    )
    if (!item) {
      return res.status(404).json({ error: 'Item not found after update' })
    }
    if (location) {
      await Shelf.findByIdAndUpdate(
        oldItem.location,
        { $pull: { items: item._id } },
        { session }
      )
      await Shelf.findByIdAndUpdate(
        location,
        { $push: { items: item._id } },
        { session }
      )
    }
    await session.commitTransaction()
    res.json(item)
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction()
    } else {
      next(err)
    }
  } finally {
    session.endSession()
  }
}

const getFullDate = ({
  year = Temporal.Now.plainDateISO().year,
  month,
  day,
}): string => {
  const fullDate = Temporal.PlainDate.from(
    { year, month, day },
    { overflow: 'reject' }
  )
  return fullDate.toString()
}

const getSortOptions = (sort: string): { [key: string]: 1 | -1 } =>
  sort.split(',').reduce((acc, field) => {
    const [key, order] = field.startsWith('-')
      ? [field.slice(1), -1 as const]
      : [field, 1 as const]
    acc[key] = order
    return acc
  }, {} as { [key: string]: 1 | -1 })

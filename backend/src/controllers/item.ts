import { RequestHandler } from 'express'
import mongoose from 'mongoose'
import { Temporal } from '@js-temporal/polyfill'
import { Item, Shelf } from '../models'
import { getProduct } from './OpenFoodFacts'
import { deleteFile } from './minio'

export const getItems = async (req, res, next) => {
  try {
    if (req.query.sort) {
      const { sort } = req.query
      const sortOptions = getSortOptions(sort)
      const items = await Item.find().sort(sortOptions)
      return res.json(items)
    } else {
      const items = await Item.find().sort({ expiration: 1 })
      res.json(items)
    }
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

export const createItem: RequestHandler = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { barcode, location, expiration } = req.body
    let offData
    try {
      offData = await getProduct(barcode)
    } catch (error) {
      offData = null
    }
    const expirationDate = getFullDate(expiration)
    const item = await Item.create(
      [
        {
          ...req.body,
          expiration: expirationDate,
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
    const { image } = req.body
    if (image) {
      deleteFile(image)
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
      expiration = getFullDate(expiration)
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

const getFullDate = (date: string): string => {
  const [month, day] = date.split('/').map(Number)

  const currentYear = Temporal.Now.plainDateISO().year

  const fullDate = Temporal.PlainDate.from({ year: currentYear, month, day })
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

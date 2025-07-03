import { RequestHandler } from 'express'
import Item from '../models/Item'

export const getItems: RequestHandler = async (req, res, next) => {
  try {
    const items = await Item.find()
    res.json(items)
  } catch (err) {
    next(err)
  }
}

export const createItem: RequestHandler = async (req, res, next) => {
  try {
    const item = await Item.create(req.body)
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

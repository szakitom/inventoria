import { Document, Schema, model } from 'mongoose'

export interface IItem extends Document {
  name: string
  img?: string
  barcode: string
  amount: number
  quantity?: number
  expiration?: Date
  createdAt: Date
  owner?: string
  location: string
  openFoodFacts?: object
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true, index: true },
  img: { type: String },
  barcode: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, default: 1 },
  quantity: { type: Number, default: 1 },
  expiration: { type: Date },
  createdAt: { type: Date, default: Date.now },
  owner: { type: String, index: true },
  location: { type: String, required: true, index: true },
  openFoodFacts: { type: Object },
})

ItemSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id
  },
})

const Item = model<IItem>('Item', ItemSchema)
export default Item

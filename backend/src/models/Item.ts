import { Document, Schema, model } from 'mongoose'
import { Temporal } from '@js-temporal/polyfill'

export interface IItem extends Document {
  name: string
  image?: string
  barcode: string
  amount: number
  quantity?: string
  expiration?: Date
  createdAt: Date
  owner?: string
  location: Schema.Types.ObjectId
  openFoodFacts?: object
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true, index: true, trim: true },
  image: { type: String },
  barcode: { type: String, index: true, trim: true },
  amount: { type: Number, required: true, default: 1 },
  quantity: { type: String, default: '', trim: true },
  expiration: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now },
  owner: { type: String },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Shelf',
    required: true,
  },
  openFoodFacts: { type: Object, select: false },
})

ItemSchema.virtual('expiresIn').get(function (this: IItem) {
  if (!this.expiration) {
    return null
  }
  const today = Temporal.Now.plainDateTimeISO()

  const expirationISO = this.expiration.toISOString()
  const expiration =
    Temporal.Instant.from(expirationISO).toZonedDateTimeISO('UTC')

  const diff = today.until(expiration, {
    largestUnit: 'days',
    smallestUnit: 'days',
  })
  const roundedDiff = diff.round({
    largestUnit: 'days',
    smallestUnit: 'days',
  })

  return roundedDiff.days
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

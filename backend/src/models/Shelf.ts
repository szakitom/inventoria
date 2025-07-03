import { Document, Schema, model } from 'mongoose'

export interface IShelf extends Document {
  name: string
  location: Schema.Types.ObjectId
  items: Schema.Types.ObjectId[]
}

const ShelfSchema = new Schema<IShelf>({
  name: { type: String, required: true, index: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location' },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
})

ShelfSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id
  },
})

const Shelf = model<IShelf>('Shelf', ShelfSchema)
export default Shelf

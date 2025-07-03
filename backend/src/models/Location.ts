import { Document, Schema, Types, model } from 'mongoose'

export interface ILocation extends Document {
  name: string
  shelves: Types.ObjectId[]
}

const LocationSchema = new Schema<ILocation>({
  name: { type: String, required: true, index: true, unique: true, trim: true },
  shelves: [{ type: Schema.Types.ObjectId, ref: 'Shelf' }],
})

LocationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id
  },
})

const Location = model<ILocation>('Location', LocationSchema)
export default Location

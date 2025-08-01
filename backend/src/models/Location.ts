import { Document, Schema, Types, model } from 'mongoose'

export interface ILocation extends Document {
  name: string
  shelves: Types.ObjectId[]
  type: LocationType
}

enum LocationType {
  Freezer = 'Freezer',
  Refrigerator = 'Refrigerator',
  Pantry = 'Pantry',
  Other = 'Other',
}

const LocationSchema = new Schema<ILocation>({
  name: { type: String, required: true, index: true, unique: true, trim: true },
  shelves: [{ type: Schema.Types.ObjectId, ref: 'Shelf' }],
  type: {
    type: String,
    enum: Object.values(LocationType),
    default: LocationType.Other,
  },
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

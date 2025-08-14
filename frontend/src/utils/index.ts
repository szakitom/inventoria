import { MapPin, Refrigerator, Rows3, Snowflake } from 'lucide-react'

export const LocationType = {
  Freezer: 'Freezer',
  Refrigerator: 'Refrigerator',
  Pantry: 'Pantry',
  Other: 'Other',
} as const

export interface IItem {
  id: string
  name: string
  location: {
    location: {
      name: string
      type: (typeof LocationType)[keyof typeof LocationType]
    }
    name: string
  }
  locationName?: string
  shelfName?: string
  barcode: string
  quantity?: string | number
  expiration?: string | null
  createdAt: string
  expiresIn?: number
  amount?: string | number
  openFoodFacts?: {
    code: string
    nutriments: {
      'energy-kj_100g': number
      'energy-kcal_100g': number
      fat_100g: number
      'saturated-fat_100g': number
      sugars_100g: number
      proteins_100g: number
      salt_100g: number
      carbohydrates_100g: number
    }
    product_name: string
    selected_images: {
      front: {
        display: { [lang: string]: string }
        small: { [lang: string]: string }
        thumb: { [lang: string]: string }
      }
    }
  }
  image?: string
  blurhash?: string
}

export const arraysEqual = (a: string[], b: string[]) => {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

export const getLocationIcon = (type: string) => {
  if (type === LocationType.Freezer) {
    return Snowflake
  }
  if (type === LocationType.Refrigerator) {
    return Refrigerator
  }
  if (type === LocationType.Pantry) {
    return Rows3
  }
  return MapPin
}

export const getExpirationStatus = (expiresIn: number | undefined) => {
  if (!expiresIn && expiresIn !== 0)
    return {
      color: 'text-gray-500',
      border: 'border-muted',
    }
  if (expiresIn <= 0) return { color: 'text-red-500', border: 'border-red-500' }
  if (expiresIn <= 30)
    return { color: 'text-yellow-500', border: 'border-yellow-500' }
  if (expiresIn <= 60)
    return { color: 'text-orange-500', border: 'border-orange-500' }
  return { color: 'text-green-500', border: 'border-muted' }
}

export const getChangedValues = <T extends Record<string, unknown>>(
  allValues: T,
  dirtyFields: Partial<Record<keyof T, boolean>>
): Partial<T> => {
  return Object.keys(dirtyFields).reduce((acc, key) => {
    const typedKey = key as keyof T
    const value = allValues[typedKey]
    if (value !== undefined) {
      acc[typedKey] = value
    }
    return acc
  }, {} as Partial<T>)
}

export const getMedianOfCodeErrors = (
  decodedCodes: Array<{ error?: number }>
) => {
  const errors = decodedCodes
    .map((x) => x.error)
    .filter((e) => typeof e === 'number') // filter out undefined/null

  if (errors.length === 0) return 1 // fallback: assume worst case

  errors.sort((a, b) => a - b)
  const mid = Math.floor(errors.length / 2)

  return errors.length % 2 === 0
    ? (errors[mid - 1] + errors[mid]) / 2
    : errors[mid]
}

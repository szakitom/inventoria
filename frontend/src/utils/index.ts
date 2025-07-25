import { LocationType } from '@components/Items'
import { MapPin, Refrigerator, Rows3, Snowflake } from 'lucide-react'

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
  if (expiresIn <= 0) return { color: 'text-red-500', border: 'border-red-300' }
  if (expiresIn <= 30)
    return { color: 'text-yellow-500', border: 'border-yellow-300' }
  if (expiresIn <= 60)
    return { color: 'text-orange-500', border: 'border-orange-300' }
  return { color: 'text-green-500', border: 'border-muted' }
}

import type { IItem } from '@components/Items'
import type { Location } from '@components/LocationSelect'

export const fetchItems = async ({
  sort,
  page,
  limit,
  search,
  locations,
  signal,
  shelves,
}: {
  sort: string
  page: number
  limit: number
  search: string
  locations?: string[]
  shelves?: string[]
  signal: AbortSignal
}) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch(
    `/api/items?sort=${sort}&page=${page}&limit=${limit}&search=${search}&locations=${locations?.join(',')}&shelves=${shelves?.join(',')}`,
    { signal }
  )
  if (!res.ok) throw new Error('Failed to fetch posts')
  const data = await res.json()
  return data
}

export const fetchLocations = async ({ signal }: { signal: AbortSignal }) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch('/api/locations', { signal })
  if (!res.ok) throw new Error('Failed to fetch locations')
  const data = await res.json()
  return data
}

export const fetchShelves = async ({
  locationId,
  signal,
}: {
  locationId: string
  signal: AbortSignal
}) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch(`/api/locations/${locationId}/shelves`, { signal })
  if (!res.ok) throw new Error('Failed to fetch location')
  const data = await res.json()
  return data
}

export const deleteItem = async (itemId: string) => {
  const res = await fetch(`/api/items/${itemId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete item')
  return res.json()
}

export const updateItem = async (itemId: string, data: Partial<IItem>) => {
  const res = await fetch(`/api/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update item')
  return res.json()
}

export const moveItem = async (itemId: string, location: string) => {
  const res = await fetch(`/api/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location }),
  })
  if (!res.ok) throw new Error('Failed to move item')
  return res.json()
}

export const editItem = async (itemId: string, data: Partial<IItem>) => {
  const res = await fetch(`/api/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to edit item')
  return res.json()
}

export const updateLocation = async (
  locationId: string,
  data: Partial<Location>
) => {
  const res = await fetch(`/api/locations/${locationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update location')
  return res.json()
}

// TODO: create location

export const createItem = async (data: Partial<IItem>) => {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create item')
  return res.json()
}

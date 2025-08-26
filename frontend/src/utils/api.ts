import type { Location } from '@/components/LocationSelect'
import type { IItem } from '@/utils/index'

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
  if (!res.ok) throw new Error('Failed to fetch items')
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

export const movePartialItem = async (
  itemId: string,
  location: string,
  amount: number
) => {
  const res = await fetch(`/api/items/${itemId}/partial`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location, amount }),
  })
  if (!res.ok) throw new Error('Failed to move partial item')
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

export const createLocation = async (data: Partial<Location>) => {
  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create location')
  return res.json()
}

interface CreateItemPayload {
  name: string
  barcode?: string
  expiration?: string | null
  amount: number
  quantity?: string
  location: string
}

export const createItem = async (data: CreateItemPayload) => {
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

export const fetchFeaturedItems = async ({
  signal,
}: {
  signal: AbortSignal
}) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch('/api/items/featured', { signal })
  if (!res.ok) throw new Error('Failed to fetch featured items')
  return res.json()
}

export const getPresignUrl = async ({ signal }: { signal: AbortSignal }) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch('/api/s3/presign', { signal, cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to get presigned URL')
  return res.json()
}

export const getPresignUrlForId = async ({
  signal,
  id,
}: {
  signal: AbortSignal
  id: string
}) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch(`/api/s3/presign/${id}`, { signal })
  if (!res.ok) throw new Error('Failed to get presigned URL for ID')
  return res.json()
}

export const uploadFileToS3 = (
  file: Blob,
  presignedUrl: string,
  onProgress?: (percent: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(presignedUrl.split('?')[0])
      } else {
        reject(new Error(`Failed to upload file: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))

    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}

export const deleteFileFromS3 = async (url: string) => {
  const res = await fetch('/api/s3', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error('Failed to create item')
  return res.json()
}

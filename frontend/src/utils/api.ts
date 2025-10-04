import { createRoot } from 'react-dom/client'
import React from 'react'
import type { Location } from '@/components/LocationSelect'
import type { IItem } from '@/utils/index'
import AuthRedirect from '@/components/AuthRedirect'

const apiFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(url, {
    credentials: 'include', // send Cloudflare Access cookies
    ...options,
  })

  const contentType = res.headers.get('content-type') || ''

  // Detect when Cloudflare returns the login page instead of JSON
  if (contentType.includes('text/html')) {
    console.warn('Session expired, redirecting to Cloudflare Access login...')
    // THIS ONLY REDIRECTS
    // window.location.href = '/' // trigger Access login flow
    // THIS Render a temporary screen
    const root = document.getElementById('root')
    if (root) {
      const r = createRoot(root)
      r.render(React.createElement(AuthRedirect))
    }

    // Delay slightly so user sees the message
    setTimeout(() => {
      window.location.href = '/' // triggers Access login
    }, 500)

    throw new Error('Session expired')
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export const fetchItems = async (params: {
  sort: string
  page: number
  limit: number
  search: string
  locations?: string[]
  shelves?: string[]
  signal: AbortSignal
}) => {
  const { sort, page, limit, search, locations, shelves, signal } = params

  const query = new URLSearchParams({
    sort,
    page: page.toString(),
    limit: limit.toString(),
    search,
    locations: locations?.join(',') ?? '',
    shelves: shelves?.join(',') ?? '',
  })

  return apiFetch(`/api/items?${query}`, { signal })
}

export const fetchLocations = async ({ signal }: { signal: AbortSignal }) => {
  return apiFetch('/api/locations', { signal })
}

export const fetchShelves = async ({
  locationId,
  signal,
}: {
  locationId: string
  signal: AbortSignal
}) => {
  return apiFetch(`/api/locations/${locationId}/shelves`, { signal })
}

export const deleteItem = async (itemId: string) => {
  return apiFetch(`/api/items/${itemId}`, { method: 'DELETE' })
}

export const updateItem = async (itemId: string, data: Partial<IItem>) => {
  return apiFetch(`/api/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const moveItem = async (itemId: string, location: string) => {
  return apiFetch(`/api/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location }),
  })
}

export const movePartialItem = async (
  itemId: string,
  location: string,
  amount: number
) => {
  return apiFetch(`/api/items/${itemId}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, amount }),
  })
}

export const editItem = async (itemId: string, data: Partial<IItem>) => {
  return apiFetch(`/api/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const updateLocation = async (
  locationId: string,
  data: Partial<Location>
) => {
  return apiFetch(`/api/locations/${locationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const createLocation = async (data: Partial<Location>) => {
  return apiFetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
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
  return apiFetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const fetchFeaturedItems = async ({
  signal,
}: {
  signal: AbortSignal
}) => {
  return apiFetch('/api/items/featured', { signal })
}

export const getPresignUrl = async ({ signal }: { signal: AbortSignal }) => {
  return apiFetch('/api/s3/presign', { signal, cache: 'no-store' })
}

export const getPresignUrlForId = async ({
  signal,
  id,
}: {
  signal: AbortSignal
  id: string
}) => {
  return apiFetch(`/api/s3/presign/${id}`, { signal })
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
  return apiFetch('/api/s3', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

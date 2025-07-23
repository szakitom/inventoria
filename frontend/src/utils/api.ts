export const fetchItems = async ({
  sort,
  page,
  limit,
  search,
  locations,
  signal,
}: {
  sort: string
  page: number
  limit: number
  search: string
  locations?: string[]
  signal: AbortSignal
}) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  const res = await fetch(
    `/api/items?sort=${sort}&page=${page}&limit=${limit}&search=${search}&locations=${locations?.join(',')}`,
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

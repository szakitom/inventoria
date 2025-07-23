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
  console.log(
    'Fetching items with filter:',
    sort,
    `/api/items?sort=${sort}&page=${page}&limit=${limit}&search=${search}&locations=${locations?.join(',')}`
  )
  const res = await fetch(
    `/api/items?sort=${sort}&page=${page}&limit=${limit}&search=${search}&locations=${locations?.join(',')}`,
    { signal }
  )
  if (!res.ok) throw new Error('Failed to fetch posts')
  const data = await res.json()
  console.log('Items fetched:', data)
  return data
}

export const fetchLocations = async ({ signal }: { signal: AbortSignal }) => {
  if (signal.aborted) {
    throw new Error('Fetch aborted')
  }
  console.log('Fetching locations from /api/locations')
  const res = await fetch('/api/locations', { signal })
  if (!res.ok) throw new Error('Failed to fetch locations')
  const data = await res.json()
  console.log('Locations fetched:', data)
  return data
}

import {
  Await,
  createFileRoute,
  defer,
  Link,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

interface Item {
  id: string | number
  name: string
  barcode: string
  expiration: string
  location?: string
}

interface Location {
  id: string | number
  name: string
}

const defaultValues = {
  sort: 'name' as const,
  page: 1,
  limit: 10,
  search: '',
  locations: [] as string[],
}

const productSearchSchema = z.object({
  sort: z
    .enum(['name', 'amount', 'expiration', '-name', '-amount', '-expiration'])
    .default(defaultValues.sort),
  page: z.number().int().min(1).default(defaultValues.page),
  limit: z.number().int().min(1).default(defaultValues.limit),
  search: z.string().default(defaultValues.search),
  locations: z.array(z.string()).default(defaultValues.locations),
})

const fetchItems = async ({
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
  return data
}

const fetchLocations = async () => {
  console.log('Fetching locations from /api/locations')
  const res = await fetch('/api/locations')
  if (!res.ok) throw new Error('Failed to fetch locations')
  const data = await res.json()
  console.log('Locations fetched:', data)
  return data
}

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodValidator(productSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  beforeLoad: ({ search }) => {
    console.log('Search parameters:', search)
  },
  loaderDeps: ({ search: { sort, limit, page, search, locations } }) => ({
    sort,
    limit,
    page,
    search,
    locations,
  }),
  loader: async ({
    abortController,
    deps: { sort, limit, page, search, locations },
  }) => {
    return {
      items: await fetchItems({
        sort,
        limit,
        page,
        search,
        locations,
        signal: abortController.signal,
      }),
      deferredSlowData: defer(fetchLocations()),
    }
  },
})

function Index() {
  const rawSearch = Route.useSearch()

  // Memoize to stabilize reference and pick only what you need
  const currentSearch = useMemo(() => {
    return {
      sort: rawSearch.sort,
      page: rawSearch.page,
      limit: rawSearch.limit,
      search: rawSearch.search,
      locations: rawSearch.locations || [],
    }
  }, [
    rawSearch.sort,
    rawSearch.page,
    rawSearch.limit,
    rawSearch.search,
    rawSearch.locations,
  ])
  const { sort, page = 1, limit = 10, search, locations } = currentSearch
  const { items: pageItems, deferredSlowData } = Route.useLoaderData()
  const { total, pages, items } = pageItems || { total: 0, items: [] as Item[] }
  const sortValue = sort?.replace(/^-/, '') || defaultValues.sort
  const direction = sort?.startsWith('-') ? '-' : ''
  const navigate = useNavigate({ from: Route.fullPath })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [searchValue, setSearchValue] = useState(search || '')

  useEffect(() => {
    if (searchValue !== currentSearch.search) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        navigate({
          search: {
            ...currentSearch,
            search: searchValue,
            page: 1,
          },
        })
      }, 300)

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }
  }, [searchValue, currentSearch, navigate])

  return (
    <div className="p-2">
      <nav>
        <li>
          <Link to="/locations">Locations</Link>
        </li>
        <li>
          <Link to="/items/add">Add Item</Link>
        </li>
      </nav>
      <select
        multiple
        value={locations}
        onChange={(e) => {
          const selectedLocations = e.target.value
          console.log('Selected locations:', selectedLocations)
          navigate({
            search: {
              ...currentSearch,
              locations: Array.from(
                e.target.selectedOptions,
                (option) => option.value
              ),
            },
          })
        }}
      >
        <Suspense fallback={<option disabled>Loading locations...</option>}>
          <Await promise={deferredSlowData}>
            {(locations: Location[]) =>
              locations.map((location: Location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))
            }
          </Await>
        </Suspense>
      </select>
      <br />

      <main>
        <div>
          <label>
            Sort by:
            <select
              value={sortValue}
              onChange={(e) => {
                navigate({
                  search: {
                    ...currentSearch,
                    sort: (direction + e.target.value) as
                      | 'name'
                      | 'amount'
                      | 'expiration'
                      | '-name'
                      | '-amount'
                      | '-expiration',
                  },
                })
              }}
            >
              <option value="name">Name</option>
              <option value="expiration">Expiration</option>
              <option value="amount">Amount</option>
            </select>
          </label>
          <label>
            <select
              value={direction}
              onChange={(e) => {
                navigate({
                  search: {
                    ...currentSearch,
                    sort: (e.target.value + sortValue) as
                      | 'name'
                      | 'amount'
                      | 'expiration'
                      | '-name'
                      | '-amount'
                      | '-expiration',
                  },
                })
              }}
            >
              <option value="-">Descending</option>
              <option value="">Ascending</option>
            </select>
          </label>
          <label>
            Search:
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </label>

          <button
            onClick={() => {
              setSearchValue('') // Reset local input state too
              navigate({
                search: {}, // Clear all search params
              })
            }}
          >
            Reset
          </button>
        </div>
        <h4>Items</h4>
        {items.length > 0 ? (
          <ul>
            {items.map((item: Item) => (
              <li key={item.id}>
                {item.name} - {item.barcode}
                <span> - {item.expiration}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items found.</p>
        )}
        <div>
          <p>
            Page {page} of {pages} (Total: {total} items)
          </p>
          <button
            disabled={page <= 1}
            onClick={() => {
              navigate({
                search: { ...currentSearch, page: page - 1 },
              })
            }}
          >
            Previous
          </button>
          <button
            disabled={page >= pages}
            onClick={() => {
              navigate({
                search: { ...currentSearch, page: page + 1 },
              })
            }}
          >
            Next
          </button>
          <br />
          <label>
            Items per page:
            <select
              value={limit}
              onChange={(e) => {
                navigate({
                  search: {
                    ...currentSearch,
                    limit: Number(e.target.value),
                    page: 1,
                  },
                })
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </main>
    </div>
  )
}

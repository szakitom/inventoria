import { DialogProvider } from '@/hooks/DialogProvider'
import Filterbar from '@components/Filterbar'
import Items from '@components/Items'
import Pagination from '@components/Pagination'
import {
  createFileRoute,
  defer,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { fetchItems, fetchLocations, fetchShelves } from '@utils/api'
import { Item } from '@utils/item'
import { useTransition } from 'react'

export const Route = createFileRoute('/locations/$location/')({
  component: Location,
  validateSearch: zodValidator(Item.itemSearchSchema),
  search: {
    middlewares: [stripSearchParams(Item.defaultValues)],
  },
  loaderDeps: ({
    search: { sort, limit, page, search, locations, shelves },
  }) => ({
    sort,
    limit,
    page,
    search,
    locations,
    shelves,
  }),
  loader: async ({
    params: { location },
    abortController,
    deps: { sort, limit, page, search, shelves },
  }) => {
    return {
      shelves: defer(
        fetchShelves({
          locationId: location,
          signal: abortController.signal,
        })
      ),
      locations: defer(fetchLocations({ signal: abortController.signal })),
      items: await fetchItems({
        sort,
        limit,
        page,
        search,
        shelves,
        locations: [location],
        signal: abortController.signal,
      }),
    }
  },
})

function Location() {
  const [isPending, startTransition] = useTransition()
  const navigate = useNavigate({ from: '/locations/$location' })

  const handleNavigate = async (options: Parameters<typeof navigate>[0]) => {
    await startTransition(() => navigate(options))
  }

  return (
    <main>
      <Filterbar
        route={Route}
        navigate={handleNavigate}
        isPending={isPending}
        withShelves
      />
      <DialogProvider>
        <Items navigate={handleNavigate} from="/locations/$location/" />
      </DialogProvider>
      <Pagination
        route={Route}
        navigate={handleNavigate}
        isPending={isPending}
      />
    </main>
  )
}

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
import { fetchItems, fetchLocations } from '@utils/api'
import { Item } from '@utils/item'
import { useTransition } from 'react'

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodValidator(Item.itemSearchSchema),
  search: {
    middlewares: [stripSearchParams(Item.defaultValues)],
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
      locations: defer(fetchLocations({ signal: abortController.signal })),
    }
  },
})

function Index() {
  const [isPending, startTransition] = useTransition()
  const navigate = useNavigate({ from: '/' })

  const handleNavigate = async (options: Parameters<typeof navigate>[0]) => {
    await startTransition(() => navigate(options))
  }

  return (
    <main>
      <Filterbar
        route={Route}
        navigate={handleNavigate}
        isPending={isPending}
      />
      <DialogProvider>
        <Items navigate={handleNavigate} from="/" />
      </DialogProvider>
      <Pagination
        route={Route}
        navigate={handleNavigate}
        isPending={isPending}
      />
    </main>
  )
}

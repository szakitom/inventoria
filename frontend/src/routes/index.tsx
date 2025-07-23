import Filterbar from '@components/Filterbar'
import Pagination from '@components/Pagination'
import {
  createFileRoute,
  defer,
  stripSearchParams,
} from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { fetchItems, fetchLocations } from '@utils/api'
import { Item } from '@utils/item'

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
  return (
    <main>
      <Filterbar route={Route} />

      <Pagination route={Route} />
    </main>
  )
}

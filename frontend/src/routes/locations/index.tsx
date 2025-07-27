import Locations from '@components/Locations'
import { createFileRoute } from '@tanstack/react-router'
import { fetchLocations } from '@utils/api'

export const Route = createFileRoute('/locations/')({
  component: LocationsPage,
  loader: async ({ abortController }) => {
    console.log('loader called')
    return {
      locations: await fetchLocations({
        signal: abortController.signal,
      }),
    }
  },
})

function LocationsPage() {
  return (
    <main>
      <Locations />
    </main>
  )
}

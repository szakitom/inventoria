import { DialogProvider } from '@/hooks/DialogProvider'
import Locations from '@components/Locations'
import { createFileRoute } from '@tanstack/react-router'
import { fetchLocations } from '@utils/api'

export const Route = createFileRoute('/locations/')({
  component: LocationsPage,
  loader: async ({ abortController }) => {
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
      <DialogProvider>
        <Locations />
      </DialogProvider>
    </main>
  )
}

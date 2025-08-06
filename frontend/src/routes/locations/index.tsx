import { createFileRoute } from '@tanstack/react-router'
import { DialogProvider } from '@/hooks/DialogProvider'
import { fetchLocations } from '@/utils/api'
import Locations from '@/components/Locations'

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

import { getRouteApi } from '@tanstack/react-router'
import Location from './Location'
import type { Location as LocationType } from './LocationSelect'
import { useDialog } from '@/hooks/useDialog'
import EditLocationDialog from './EditLocationDialog'

const route = getRouteApi('/locations/')

const Locations = () => {
  const data = route.useLoaderData()

  useDialog(EditLocationDialog, 'edit')

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 gap-4 w-full">
        {data.locations?.map((location: LocationType) => (
          <Location location={location} key={location.id} />
        ))}
      </div>
    </div>
  )
}

export default Locations

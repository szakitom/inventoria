import { getRouteApi } from '@tanstack/react-router'
import Location from './Location'
import type { Location as LocationType } from './LocationSelect'

const route = getRouteApi('/locations/')

const Locations = () => {
  const data = route.useLoaderData()

  return (
    <div className="relative overflow-hidden w-full p-4">
      <div className="grid grid-cols-1 gap-4">
        {data.locations?.map((location: LocationType) => (
          <Location location={location} key={location.id} />
        ))}
      </div>
    </div>
  )
}

export default Locations

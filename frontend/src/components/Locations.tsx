import { getRouteApi, useRouter } from '@tanstack/react-router'
import Location from './Location'
import type { Location as LocationType } from './LocationSelect'
import { useDialog } from '@/hooks/useDialog'
import EditLocationDialog from './EditLocationDialog'
import Fab from './Fab'
import CrateLocationDialog from './CreateLocationDialog'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'
import { createLocation } from '@utils/api'

const route = getRouteApi('/locations/')

const Locations = () => {
  const data = route.useLoaderData()
  const router = useRouter()

  useDialog(EditLocationDialog, 'edit')
  useDialog(CrateLocationDialog, 'create')

  const { open } = useGlobalDialog()

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 gap-4 w-full mb-14">
        {data.locations?.map((location: LocationType) => (
          <Location location={location} key={location.id} />
        ))}
      </div>
      <Fab
        onClick={() =>
          open('create', {
            onSubmit: async (location: Partial<LocationType>) => {
              await createLocation({
                name: location.name,
                type: location.type,
                count: location.count,
              })
              router.invalidate()
            },
          })
        }
      />
    </div>
  )
}

export default Locations

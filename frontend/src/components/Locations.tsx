import { getRouteApi, useRouter } from '@tanstack/react-router'
import { createLocation } from '@/utils/api'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'
import { useDialog } from '@/hooks/useDialog'
import Location from '@/components/Location'
import type { Location as LocationType } from '@/components/LocationSelect'
import EditLocationDialog from '@/components/EditLocationDialog'
import Fab from '@/components/Fab'
import CrateLocationDialog from '@/components/CreateLocationDialog'

const route = getRouteApi('/locations/')

const Locations = () => {
  const data = route.useLoaderData()
  const router = useRouter()

  useDialog(EditLocationDialog, 'edit')
  useDialog(CrateLocationDialog, 'create')

  const { open } = useGlobalDialog()

  return (
    <div className="max-w-4xl mx-auto p-4 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="grid grid-cols-1 gap-6 w-full mb-16">
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

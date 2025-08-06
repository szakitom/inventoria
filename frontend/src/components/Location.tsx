import { Link, useRouter } from '@tanstack/react-router'
import type { Location as LocationType } from './LocationSelect'
import { Separator } from './ui/separator'
import { getLocationIcon } from '@utils/index'
import { Button } from './ui/button'
import { PencilIcon } from 'lucide-react'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { updateLocation } from '@utils/api'

const Location = ({ location }: { location: LocationType }) => {
  const router = useRouter()
  const LocationIcon = getLocationIcon(location.type || '')
  const { open } = useGlobalDialog()

  const handleEditLocation = async (payload: Partial<LocationType>) => {
    try {
      await updateLocation(location.id, payload)
      toast.success('Changes saved successfully!')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to save changes')
      console.error('Error saving item:', error)
    }
  }

  return (
    <div className="p-5 rounded-lg border border-transparent hover:border-blue-300 shadow-sm hover:shadow-md transition-shadow duration-200 w-full bg-background">
      <div className="text-2xl font-semibold flex items-center gap-3">
        <LocationIcon className="w-6 h-6 mr-2 text-blue-500" />
        <Link
          key={location.id}
          to="/locations/$location"
          params={{ location: location.id }}
          search={{ shelves: [] }}
          className="hover:underline flex-grow"
        >
          {location.name}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer ml-4 hover:bg-gray-200"
          aria-label={`Edit ${location.name}`}
          onClick={() =>
            open('edit', { onSubmit: handleEditLocation, data: location })
          }
        >
          <PencilIcon size={24} />
        </Button>
      </div>
      <Separator className="my-2" />
      <div className="text-sm text-muted-foreground flex flex-wrap w-full gap-2">
        {location.shelves.map((shelf) => (
          <Badge variant="outline" key={shelf.id} asChild>
            <Link
              to="/locations/$location"
              params={{ location: location.id }}
              search={{ shelves: [shelf.id] }}
              className="p-2 border rounded hover:bg-muted hover:no-underline transition"
            >
              <div className="text-base flex flex-wrap w-full gap-2">
                {shelf.name.replace('Shelf ', 'Polc ')}
              </div>
            </Link>
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default Location

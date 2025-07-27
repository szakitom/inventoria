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
    <div className="p-4 rounded-lg shadow-md w-full">
      <div className="text-2xl font-semibold flex items-center">
        <LocationIcon className="w-6 h-6 mr-2 text-blue-500" />
        <Link
          key={location.id}
          to="/locations/$location"
          params={{ location: location.id }}
          className="hover:underline w-full"
        >
          {location.name}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer ml-auto hover:bg-gray-200"
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
              to="/locations/$location/$shelf"
              params={{ location: location.id, shelf: shelf.id }}
              className="p-2 border hover:no-underline"
            >
              <span className="text-lg">
                {shelf.name.replace('Shelf ', 'Polc ')}
              </span>
            </Link>
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default Location

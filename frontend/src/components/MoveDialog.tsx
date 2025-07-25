import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { getRouteApi } from '@tanstack/react-router'
import { use, useId, useState } from 'react'
import { getLocationIcon } from '@utils/index'
import { Badge } from './ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Label } from './ui/label'
import { on } from 'events'

interface Location {
  id: string
  name: string
  type?: string
  shelves: Shelf[]
}

interface Shelf {
  id: string
  name: string
}

interface MoveDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (shelfId: string) => Promise<void>
  data?: {
    location?: {
      location?: {
        id: string
        type?: string
        name?: string
      }
    }
    [key: string]: unknown
  }
}

const MoveDialog = ({
  isOpen,
  onCancel,
  onSubmit,
  data: item,
}: MoveDialogProps) => {
  const route = getRouteApi('/')
  const data = route.useLoaderData()
  const locations = use(data.locations)
  const LocationIcon = getLocationIcon(
    item?.location?.location?.type || 'default'
  )

  const currentLocation: Location | undefined = item?.location?.location as
    | Location
    | undefined
  const currentShelf: Shelf = item?.location as Shelf
  const [selectedLocation, setLocation] = useState<string>(
    currentLocation?.id || ''
  )
  const [selectedShelf, setShelf] = useState<string>('')

  const locationSelectId = useId()
  const shelfSelectId = useId()

  const handleLocationChange = (value: string) => {
    setLocation(value)
    setShelf('')
  }

  const handleShelfChange = (value: string) => {
    setShelf(value)
  }

  const handleSubmit = async () => {
    onSubmit(selectedShelf)
  }

  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
          <DialogDescription>
            <span className="flex items-center space-x-1 text-sm text-muted-foreground mt-1 truncate">
              <LocationIcon className="h-4 w-4 text-blue-500" />
              <span>Moving from</span>
              <span className="truncate">
                {currentLocation?.name}
                <Badge variant="outline" className="ml-2">
                  {currentShelf.name.replace('Shelf', '')}
                </Badge>
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Label
            htmlFor={locationSelectId}
            className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer"
          >
            New Location
          </Label>
          <Select value={selectedLocation} onValueChange={handleLocationChange}>
            <SelectTrigger
              id={locationSelectId}
              className="w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location: Location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLocation && (
            <>
              <Label
                htmlFor={shelfSelectId}
                className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer"
              >
                New Shelf
              </Label>
              <Select value={selectedShelf} onValueChange={handleShelfChange}>
                <SelectTrigger
                  id={shelfSelectId}
                  className="w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <SelectValue placeholder="Select a Shelf" />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .find((l: Location) => l.id === selectedLocation)
                    .shelves.map((shelf: Shelf) => (
                      <SelectItem
                        key={shelf.id}
                        value={shelf.id}
                        disabled={shelf.id === currentShelf.id}
                      >
                        {shelf.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            className="cursor-pointer hover:bg-gray-200"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-blue-500 hover:bg-blue-600"
            onClick={handleSubmit}
            disabled={!selectedShelf}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MoveDialog

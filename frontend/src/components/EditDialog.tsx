import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import LocationSelect, { type Shelf, type Location } from './LocationSelect'
import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'

interface EditDialogProps {
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

const EditDialog = ({
  isOpen,
  onCancel,
  onSubmit,
  data: item,
}: EditDialogProps) => {
  const route = getRouteApi('/')
  const data = route.useLoaderData()
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null)

  const currentLocation: Location | undefined = item?.location?.location as
    | Location
    | undefined
  const currentShelf: Shelf = item?.location as Shelf

  const handleSubmit = async () => {
    console.log('submitting', selectedShelf)
  }

  const handleShelfSelect = (shelfId: string) => {
    setSelectedShelf(shelfId)
  }

  console.log(item, 'item in edit dialog')

  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Editing details for {(item?.name as string) || 'this item'}.
          </DialogDescription>
        </DialogHeader>
        <LocationSelect
          locations={data.locations}
          currentLocation={currentLocation}
          currentShelf={currentShelf}
          onSelect={handleShelfSelect}
          withDefaultShelf
        />
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
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog

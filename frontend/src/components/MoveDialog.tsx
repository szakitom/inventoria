import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { useLoaderData } from '@tanstack/react-router'
import { useState } from 'react'
import { getLocationIcon } from '@utils/index'
import { Badge } from './ui/badge'
import LocationSelect, { type Shelf, type Location } from './LocationSelect'
import { Spinner } from './ui/spinner'

interface MoveDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (shelfId: string) => Promise<void>
  data?: {
    from: '/' | '/locations/$location/'
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
  const data = useLoaderData({ from: item?.from ?? '/' })

  const LocationIcon = getLocationIcon(
    item?.location?.location?.type || 'default'
  )
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null)

  const currentLocation: Location | undefined = item?.location?.location as
    | Location
    | undefined
  const currentShelf: Shelf = item?.location as Shelf
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    if (selectedShelf) {
      await onSubmit(selectedShelf)
    }
    setSubmitting(false)
  }

  const handleShelfSelect = (shelfId: string) => {
    setSelectedShelf(shelfId)
  }

  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
          <DialogDescription>
            <span className="flex items-center space-x-1 text-sm mt-1 truncate">
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
        <LocationSelect
          locations={data?.locations}
          currentLocation={currentLocation}
          currentShelf={currentShelf}
          onSelect={handleShelfSelect}
        />
        <DialogFooter>
          <Button
            variant="secondary"
            className="cursor-pointer "
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 min-w-20"
            onClick={handleSubmit}
            disabled={!selectedShelf || submitting}
          >
            {submitting ? <Spinner /> : 'Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MoveDialog

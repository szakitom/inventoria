import { useState, useRef, useEffect } from 'react'
import { useLoaderData } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { CheckboxCard } from '@/components/ui/checkboxcard'
import AmountInput from '@/components/ui/amountinput'
import { getLocationIcon } from '@/utils/index'
import LocationSelect, {
  type Shelf,
  type Location,
} from '@/components/LocationSelect'

interface MoveDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (shelfId: string, amountToMove?: number) => Promise<void>
  data?: {
    from: '/' | '/locations/$location/'
    location?: {
      location?: {
        id: string
        type?: string
        name?: string
      }
      name: string
    }
    amount?: number
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

  const [isPartial, setIsPartial] = useState(false)
  const [partialAmount, setPartialAmount] = useState<number>(1)
  const partialInputRef = useRef<HTMLInputElement>(null)

  const totalAmount = item?.amount ? item.amount : 1

  useEffect(() => {
    if (isPartial && partialInputRef.current) {
      partialInputRef.current.focus()
    }
  }, [isPartial])

  const handleSubmit = async () => {
    setSubmitting(true)
    if (selectedShelf) {
      if (isPartial) {
        await onSubmit(selectedShelf, partialAmount)
      } else {
        await onSubmit(selectedShelf)
      }
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
                  {currentShelf.name.split(' ')[1]}
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

        {totalAmount > 1 && (
          <CheckboxCard
            title="Move partial amount"
            description="If checked, you can specify the amount to move."
            expandable
            defaultChecked={false}
            onCheckedChange={setIsPartial}
            renderExpanded={() => (
              <div>
                <AmountInput
                  value={partialAmount}
                  onChange={setPartialAmount}
                  max={totalAmount - 1}
                />
                <div className="text-xs text-muted-foreground mt-1 ml-1">
                  Max amount to move: {totalAmount - 1}
                </div>
              </div>
            )}
          />
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 hover:bg-blue-600 min-w-20 text-white"
            onClick={handleSubmit}
            disabled={
              !selectedShelf ||
              submitting ||
              (isPartial && (partialAmount <= 0 || partialAmount > totalAmount))
            }
          >
            {submitting ? <Spinner /> : 'Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MoveDialog

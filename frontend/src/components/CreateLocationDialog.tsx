import React, { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AmountInput from '@/components/ui/amountinput'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Location } from '@/components/LocationSelect'
import { getLocationIcon } from '@/utils/index'
import { LocationType } from '@/components/Items'

interface CreateLocationDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (payload: Partial<Location>) => Promise<void>
  data?: Location
}

const CreateLocationDialog = ({
  isOpen,
  onCancel,
  onSubmit,
}: CreateLocationDialogProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [shelfCount, setShelfCount] = useState(1)
  const typeSelectId = useId()
  const nameId = useId()
  const shelfId = useId()

  const handleTypeChange = (value: string) => {
    setType(value)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    if (name && type && shelfCount >= 1) {
      await onSubmit({ name, type, count: shelfCount })
    }
    setSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Location</DialogTitle>
          <DialogDescription>Create a new location.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label
            htmlFor={nameId}
            className="text-sm font-medium whitespace-nowrap cursor-pointer"
          >
            Name
          </Label>
          <Input
            id={nameId}
            value={name}
            onChange={handleNameChange}
            className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
          />
          <Label
            htmlFor={typeSelectId}
            className="text-sm font-medium whitespace-nowrap cursor-pointer"
          >
            Type
          </Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger
              id={typeSelectId}
              className="w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>

            <SelectContent>
              {Object.values(LocationType).map((type) => (
                <SelectItem key={type} value={type}>
                  {React.createElement(getLocationIcon(type), {
                    className: 'h-4 w-4 text-blue-500',
                  })}
                  &nbsp;{type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label
            htmlFor={shelfId}
            className="text-sm font-medium whitespace-nowrap cursor-pointer"
          >
            Shelf count
          </Label>
          <AmountInput
            value={shelfCount}
            onChange={(value) => setShelfCount(value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 hover:bg-blue-600 min-w-20 text-white"
            onClick={handleSubmit}
            disabled={
              !name || !type || submitting || !shelfCount || shelfCount < 1
            }
          >
            {submitting ? <Spinner /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateLocationDialog

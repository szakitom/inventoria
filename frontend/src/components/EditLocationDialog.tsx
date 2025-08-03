import { getLocationIcon } from '@utils/index'
import type { Location } from './LocationSelect'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Spinner } from './ui/spinner'
import React, { useId, useState } from 'react'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { LocationType } from './Items'
import { Input } from './ui/input'

interface EditLocationDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (payload: Partial<Location>) => Promise<void>
  data?: Location
}

const EditLocationDialog = ({
  isOpen,
  onCancel,
  onSubmit,
  data: location,
}: EditLocationDialogProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState(location?.name || '')
  const [type, setType] = useState(location?.type || '')
  const typeSelectId = useId()
  const nameId = useId()
  const LocationIcon = getLocationIcon(location?.type || '')

  const handleTypeChange = (value: string) => {
    setType(value)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    if (name && type) {
      await onSubmit({ name, type })
    }
    setSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>
            <span className="flex items-center space-x-1 text-sm mt-1 truncate">
              <LocationIcon className="h-4 w-4 text-blue-500" />
              <span>Editing </span>
              <span className="truncate">{location?.name}</span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label
            htmlFor={nameId}
            className="text-sm font-medium  whitespace-nowrap cursor-pointer"
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
            className="text-sm font-medium  whitespace-nowrap cursor-pointer"
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
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 min-w-20 text-white"
            onClick={handleSubmit}
            disabled={!name || !type || submitting}
          >
            {submitting ? <Spinner /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditLocationDialog

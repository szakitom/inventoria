import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'

interface DeleteDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  data?: Record<string, unknown>
}

const DeleteDialog = ({ isOpen, onCancel, onSubmit }: DeleteDialogProps) => {
  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            className="cursor-pointer hover:bg-gray-200"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer hover:bg-red-400"
            onClick={onSubmit}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDialog

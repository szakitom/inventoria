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
  onChange: (open: boolean) => void
  onSubmit: () => Promise<void>
}

const DeleteDialog = ({ isOpen, onChange, onSubmit }: DeleteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
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
            onClick={() => onChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer hover:bg-red-400"
            onClick={async () => {
              await onSubmit()
              onChange(false)
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDialog

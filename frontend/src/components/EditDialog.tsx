import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'

interface EditDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  data?: Record<string, unknown>
}

const EditDialog = ({
  isOpen,
  onCancel,
  onSubmit,
  data: item,
}: EditDialogProps) => {
  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Editing details for {item?.name}.
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
            className="cursor-pointer bg-blue-500 hover:bg-blue-600"
            onClick={onSubmit}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog

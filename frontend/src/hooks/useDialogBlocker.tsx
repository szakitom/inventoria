import { useEffect, useState } from 'react'
import { useBlocker } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function useDialogBlocker(
  logic: boolean,
  callback: () => Promise<void>
) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => {
      return logic
    },
    withResolver: true,
  })

  useEffect(() => {
    if (status === 'blocked') {
      setIsDialogOpen(true)
    }
  }, [status])

  const handleCancel = () => {
    setIsDialogOpen(false)
    if (reset) {
      reset() // cancel navigation
    }
  }

  const handleSubmit = async () => {
    try {
      await callback()
      if (proceed) {
        proceed()
      }
    } finally {
      setIsDialogOpen(false)
    }
  }
  const BlockDialog = () => (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <DialogContent className="fixed flex flex-col mx-auto top-1/3 max-w-md bg-card p-6 rounded-lg shadow-lg z-50">
        <DialogHeader>
          <DialogTitle>Move page</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this page? Your changes will not be
            saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer min-w-20"
            onClick={handleSubmit}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { BlockDialog }
}

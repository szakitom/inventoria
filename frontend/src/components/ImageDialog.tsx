import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageDialogProps {
  isOpen: boolean
  onCancel: () => void
  data?: Record<string, unknown>
}

const ImageDialog = ({ isOpen, onCancel, data }: ImageDialogProps) => {
  const [visible, setVisible] = useState(isOpen)
  const [closing, setClosing] = useState(false)

  if (!isOpen) return null

  return (
    <Dialog
      key={typeof data?.image === 'string' ? data.image : 'no-image'}
      open={visible}
      onOpenChange={() => {
        setClosing(true)
        setVisible(false)
        setTimeout(() => {
          setClosing(false)
          onCancel()
        }, 300)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          'm-0 gap-0 border-none bg-transparent shadow-none p-0 duration-300',
          closing
            ? 'animate-out fade-out-0 zoom-out-95'
            : 'animate-in fade-in-0 zoom-in-95',
          'bg-transparent backdrop-blur-sm overflow-hidden'
        )}
      >
        <DialogClose
          className="absolute top-2 right-2 z-10 rounded-sm bg-black/60 p-1 text-white hover:bg-black/80 transition-colors !cursor-pointer"
          type="button"
        >
          <X className="h-5 w-5" />
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="sr-only">
            Preview item {typeof data?.name === 'string' ? data.name : ''}
          </DialogTitle>
          <DialogDescription className="sr-only">
            This is a preview of the item image.
          </DialogDescription>
        </DialogHeader>

        <img
          className="w-full max-w-lg aspect-square mx-auto object-cover"
          src={typeof data?.image === 'string' ? data.image : undefined}
          alt={`Image of ${typeof data?.name === 'string' ? data.name : ''}`}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ImageDialog

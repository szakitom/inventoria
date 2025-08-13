import { ImageUp, X } from 'lucide-react'
import { Button } from './ui/button'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import ImageCropper from './ImageCropper'
import { Dialog } from './ui/dialog'
import { deleteFileFromS3 } from '@/utils/api'
import { toast } from 'sonner'
import { useDialog } from '@/hooks/useDialog'
import DeleteDialog from './DeleteDialog'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'

type ImageUploadProps = {
  presignURL: string
  field: {
    value?: string
    onChange: (value: string) => void
    name: string
    ref: (instance: HTMLInputElement | null) => void
    onBlur: () => void
  }
}

const ImageUpload = ({ presignURL, field }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useDialog(DeleteDialog, 'delete')
  const { open } = useGlobalDialog()

  const { name, ref: rhfRef, onBlur, onChange: rhfOnChange } = field

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [inputRef])

  useEffect(() => {
    let dragCounter = 0

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter++
      setDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter--
      if (dragCounter === 0) setDragging(false)
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter = 0
      setDragging(false)

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        const image = Array.from(files).find((file) =>
          file.type.startsWith('image/')
        )

        if (image && inputRef.current) {
          const dt = new DataTransfer()
          dt.items.add(image)
          inputRef.current.files = dt.files
          inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setIsDialogOpen(true)
    }
  }

  const handleDialog = () => {
    if (isDialogOpen) {
      setFile(null)
      inputRef.current!.value = ''
    }
    setIsDialogOpen(!isDialogOpen)
  }

  const deleteUploadedImage = async () => {
    try {
      await deleteFileFromS3(uploadedImage!)
      setUploadedImage(null)
      setFile(null)
      rhfOnChange('')
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      toast.success('Image deleted successfully!')
    } catch (error) {
      console.error('Error deleting uploaded image:', error)
    }
  }

  const handleUploadComplete = (imageUrl: string) => {
    toast.success('Image uploaded successfully!')
    setUploadedImage(imageUrl)
    rhfOnChange(imageUrl)
    setIsDialogOpen(false)
  }

  useEffect(() => {
    setFile(null)
    setUploadedImage(null)
    inputRef.current!.value = ''
  }, [presignURL])

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (uploadedImage) {
        e.preventDefault()
        e.returnValue = ''
        await deleteUploadedImage()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [deleteUploadedImage, uploadedImage])

  return (
    <>
      {dragging && !uploadedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity pointer-events-none">
          <div className="rounded-lg bg-white/80 px-6 py-3 text-lg font-medium text-gray-800 shadow-md">
            Drop the image anywhere
          </div>
        </div>
      )}
      <div className="relative">
        <Button
          variant="outline"
          type="button"
          className={cn(
            'relative size-15 overflow-hidden p-0 shadow-none transition-colors',
            dragging ? 'border-blue-500 ring-2 ring-blue-300' : '',
            'focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500'
          )}
          aria-label={uploadedImage ? 'Change image' : 'Upload image'}
          onClick={handleClick}
        >
          {uploadedImage ? (
            <img
              className="size-full object-cover"
              alt="Preview of uploaded image"
              width={64}
              height={64}
              style={{ objectFit: 'cover' }}
              src={`${uploadedImage}?hash=${Math.random()}`}
            />
          ) : (
            <div aria-hidden="true">
              <ImageUp className="size-5 opacity-60" />
            </div>
          )}
        </Button>
        {uploadedImage && (
          <Button
            size="icon"
            type="button"
            className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
            aria-label="Remove image"
            onClick={() =>
              open('delete', {
                onSubmit: async () => {
                  await deleteUploadedImage()
                },
              })
            }
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <input
        ref={(el) => {
          inputRef.current = el
          rhfRef(el)
        }}
        type="file"
        name={name}
        onBlur={onBlur}
        className="sr-only"
        accept="image/*"
        style={{ display: 'none' }}
        aria-label="Upload image file"
        onChange={handleFileChange}
        tabIndex={-1}
        disabled={!!uploadedImage}
      />
      <Dialog open={isDialogOpen} onOpenChange={handleDialog}>
        <ImageCropper
          image={file ? URL.createObjectURL(file) : ''}
          presignURL={presignURL}
          onCancel={handleDialog}
          onUpload={handleUploadComplete}
        />
      </Dialog>
    </>
  )
}

export default ImageUpload

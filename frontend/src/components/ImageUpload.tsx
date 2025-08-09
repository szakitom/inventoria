import { ArrowLeft, CircleUserRound, X } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import Cropper from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { getCroppedImg } from '@utils/canvas'
import { Progress } from './ui/progress'

const ImageUpload = ({ presignURL, ...field }) => {
  console.log(field)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  console.log(presignURL)

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

        if (image) {
          console.log('Dropped image file:', image)
          handleFileChange({
            target: { files: [image] },
          } as React.ChangeEvent<HTMLInputElement>)
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

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Selected file:', file)
      setFile(file)
      setIsDialogOpen(true)
    }
  }

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        file && URL.createObjectURL(file),
        croppedAreaPixels,
        rotation
      )
      console.log('donee', { croppedImage })
      setCroppedImage(croppedImage)
      setIsDialogOpen(false)
      setFile(null) // Reset file after submission
      inputRef.current!.value = '' // Clear the input field
    } catch (e) {
      console.error(e)
    }
  }

  const resetImage = () => {
    setCroppedImage(null)
    setFile(null)
    inputRef.current!.value = '' // Clear the input field
  }

  return (
    <>
      {dragging && (
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
          aria-label={croppedImage ? 'Change image' : 'Upload image'}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
        >
          {croppedImage ? (
            <img
              className="size-full object-cover"
              alt="Preview of uploaded image"
              width={64}
              height={64}
              style={{ objectFit: 'cover' }}
              src={croppedImage}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRound className="size-5 opacity-60" />
            </div>
          )}
        </Button>
        {croppedImage && (
          <Button
            size="icon"
            type="button"
            className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
            aria-label="Remove image"
            onClick={() => {
              setCroppedImage(null)
              setFile(null)
              inputRef.current!.value = '' // Clear the input field
            }}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <input
        {...field}
        ref={inputRef}
        type="file"
        className="sr-only"
        accept="image/*"
        style={{ display: 'none' }}
        aria-label="Upload image file"
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(e) => {
          console.log(e)
          if (isDialogOpen) {
            resetImage()
          }
          setIsDialogOpen(!isDialogOpen)
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">Crop image</DialogDescription>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between border-b text-base px-4 py-2">
              <span>Crop image</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-mx-2"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetImage()
                }}
                aria-label="Cancel"
              >
                <X aria-hidden="true" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[400px] w-full overflow-hidden">
            <Cropper
              image={file ? URL.createObjectURL(file) : ''}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={false}
              objectFit="contain"
              style={{
                cropAreaStyle: {
                  borderRadius: '12px',
                },
              }}
            />
          </div>
          <DialogFooter className="border-t w-full px-4 py-6 flex gap-4 items-center space-x-2">
            <Progress value={33} />
            <Button
              className="w-full md:w-min mb-2 md:mb-0"
              onClick={showCroppedImage}
              // disabled={!previewUrl}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageUpload

import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { X } from 'lucide-react'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { uploadFileToS3 } from '@/utils/api'
import { getCroppedImg, type CroppedArea } from '@/utils/canvas'

interface ImageCropperProps {
  image: string
  onCancel: () => void
  presignURL: string
  onUpload: (response: string, blurhash: string) => void
}

const ImageCropper = ({
  image,
  onCancel,
  presignURL,
  onUpload,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<CroppedArea | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  if (!image) {
    return null
  }

  const handleCropComplete = async (
    _: CroppedArea,
    croppedAreaPixels: CroppedArea
  ): Promise<void> => {
    setCroppedArea(croppedAreaPixels)
  }

  const uploadImage = async () => {
    try {
      setUploading(true)
      setProgress(0)
      const canvasResponse = await getCroppedImg(image, croppedArea!, rotation)
      if (!canvasResponse || !canvasResponse.blob) {
        throw new Error('Failed to crop image')
      }
      const blurhash = await canvasResponse.blurhash
      const response = await uploadFileToS3(
        canvasResponse.blob,
        presignURL,
        (percent) => {
          setProgress(percent)
        }
      )
      setUploading(false)
      onUpload(response, blurhash)
      setTimeout(() => {
        setRotation(0)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
        setCroppedArea(null)
      }, 1000)
    } catch (error) {
      console.error('Error uploading cropped image:', error)
    }
  }

  return (
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
            onClick={onCancel}
            aria-label="Cancel"
          >
            <X aria-hidden="true" />
          </Button>
        </DialogTitle>
      </DialogHeader>
      <div className="relative h-[400px] w-full overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          rotation={rotation}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={handleCropComplete}
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
        {uploading && (
          <Progress
            className="bg-gray-200 [&>div]:bg-blue-500 dark:[&>div]:bg-blue-900 [&>div]:rounded-full h-1.5"
            value={progress}
          />
        )}
        <Button
          className="cursor-pointer bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 hover:bg-blue-600 min-w-20 text-white mb-2 md:mb-0"
          onClick={uploadImage}
          disabled={!croppedArea || uploading}
        >
          {uploading ? <Spinner /> : 'Upload'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default ImageCropper

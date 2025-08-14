import { Image } from 'lucide-react'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'
import { Button } from '@/components/ui/button'
import type { IItem } from '@/components/Items'

const ImagePreview = ({ image, name, openFoodFacts: off }: Partial<IItem>) => {
  const { open } = useGlobalDialog()

  const imageToUse =
    off?.selected_images?.front?.display[
      Object.keys(off.selected_images?.front?.display)[0]
    ] || image

  if (!imageToUse) {
    return (
      <div className="w-16 aspect-square bg-muted rounded-md flex items-center justify-center border-1">
        <Image className="size-6 opacity-60" />
      </div>
    )
  }

  return (
    <Button
      asChild
      type="button"
      onClick={() =>
        open('image', {
          data: {
            image: imageToUse,
            name: name || '',
          },
        })
      }
      className="w-16 h-16 object-cover rounded-md border-1"
      variant="ghost"
      size="icon"
    >
      <img
        src={`${imageToUse}`}
        alt={`Image of ${name}`}
        className="w-16 aspect-square object-cover rounded-md border-1"
      />
    </Button>
  )
}

export default ImagePreview

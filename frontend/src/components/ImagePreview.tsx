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
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-slate-400 to-slate-300 w-16 aspect-square rounded-md border blur-sm animate-pulse" />
        <img
          src={`${imageToUse}`}
          alt={`Image of ${name}`}
          className="w-16 aspect-square object-cover rounded-md border-1 absolute top-0 left-0 z-10"
          loading="lazy"
        />
      </div>
    </Button>
  )
}

export default ImagePreview

import { Image } from 'lucide-react'
import type { IItem } from './Items'

const ImagePreview = ({ image, name, openFoodFacts: off }: Partial<IItem>) => {
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
    <img
      className="w-16 aspect-square object-cover rounded-md border-1"
      src={`${imageToUse}`}
      alt={`Image of ${name}`}
    />
  )
}

export default ImagePreview

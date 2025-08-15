import { Blurhash } from 'react-blurhash'
import { Image, ImageOff } from 'lucide-react'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { IItem } from '@utils/index'

const ImagePreview = ({
  image,
  name,
  openFoodFacts: off,
  blurhash,
}: Partial<IItem>) => {
  const { open } = useGlobalDialog()
  const [loaded, setLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imageToUse =
    image ||
    off?.selected_images?.front?.display?.[
      Object.keys(off.selected_images?.front?.display || {})[0] || ''
    ]

  if (!imageToUse) {
    return (
      <div className="w-16 aspect-square bg-muted rounded-md flex items-center justify-center border-1">
        <Image className="size-6 opacity-60" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="w-16 aspect-square bg-muted border-1 border-red-400 rounded-md flex items-center justify-center">
        <ImageOff className="size-6 opacity-60" />
      </div>
    )
  }

  return (
    <Button
      asChild
      type="button"
      onClick={() =>
        open('image', {
          data: { image: imageToUse, name: name || '' },
        })
      }
      className="w-16 h-16 rounded-md border-1"
      variant="ghost"
      size="icon"
    >
      <div className="relative w-16 aspect-square overflow-hidden rounded-md">
        {!loaded &&
          (blurhash ? (
            <Blurhash
              hash={blurhash}
              width={64}
              height={64}
              resolutionX={32}
              resolutionY={32}
              punch={1}
              className="absolute inset-0"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-300 blur-sm animate-pulse" />
          ))}
        <img
          src={imageToUse}
          alt={`Image of ${name}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      </div>
    </Button>
  )
}

export default ImagePreview

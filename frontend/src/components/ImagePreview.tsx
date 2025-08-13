import { Image } from 'lucide-react'

const ImagePreview = ({ image, name }: { image: string; name: string }) => {
  if (!image) {
    return (
      <div className="w-16 aspect-square bg-muted rounded-md flex items-center justify-center border-1">
        <Image className="size-6 opacity-60" />
      </div>
    )
  }

  return (
    <img
      className="w-16 aspect-square object-cover rounded-md border-1"
      src={`${image}?hash=${Math.random()}`}
      alt={`Image of ${name}`}
    />
  )
}

export default ImagePreview

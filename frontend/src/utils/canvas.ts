const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180
}

const rotateSize = (width: number, height: number, rotRad: number) => {
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export interface CroppedArea {
  width: number
  height: number
  x: number
  y: number
}

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CroppedArea,
  rotation = 0,
  targetWidth = 512,
  targetHeight = 512,
  flip = { horizontal: false, vertical: false }
) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotRad
  )

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.fillStyle = 'transparent'
  // draw rotated image
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')

  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return null
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  const resizedCanvas = document.createElement('canvas')
  const resizedCtx = resizedCanvas.getContext('2d')
  if (!resizedCtx) {
    return null
  }
  resizedCanvas.width = targetWidth
  resizedCanvas.height = targetHeight

  const aspectRatio = pixelCrop.width / pixelCrop.height
  let drawWidth = targetWidth
  let drawHeight = targetHeight

  if (aspectRatio > 1) {
    // Wider than tall
    drawHeight = targetWidth / aspectRatio
  } else {
    // Taller than wide
    drawWidth = targetHeight * aspectRatio
  }

  resizedCtx.fillStyle = 'transparent'
  resizedCtx.fillRect(0, 0, targetWidth, targetHeight)
  resizedCtx.imageSmoothingQuality = 'high'

  resizedCtx.drawImage(
    croppedCanvas,
    (targetWidth - drawWidth) / 2,
    (targetHeight - drawHeight) / 2,
    drawWidth,
    drawHeight
  )

  // As a blob
  return new Promise<Blob>((resolve, reject) => {
    resizedCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob'))
      }
    }, 'image/png')
  })
}

export const getRotatedImage = async (imageSrc: string, rotation = 0) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const orientationChanged =
    rotation === 90 || rotation === -90 || rotation === 270 || rotation === -270
  if (orientationChanged) {
    canvas.width = image.height
    canvas.height = image.width
  } else {
    canvas.width = image.width
    canvas.height = image.height
  }

  if (!ctx) {
    return null
  }

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(image, -image.width / 2, -image.height / 2)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
    }, 'image/png')
  })
}

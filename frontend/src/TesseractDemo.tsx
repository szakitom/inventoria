import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'

import { createWorker, PSM, OEM } from 'tesseract.js'

interface WordBox {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  index: number
}

const TesseractDemo = () => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const wordBoxesRef = useRef<WordBox[]>([])
  const selectedWordsRef = useRef<WordBox[]>([])

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [webcamKey, setWebcamKey] = useState(0)
  const [showWebcam, setShowWebcam] = useState(true)
  const [bestAvailableResolution, setBestAvailableResolution] = useState({
    width: 3840,
    height: 2160,
  })
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)

  // Get available video devices
  useEffect(() => {
    const determineBestResolution = (
      capabilities: MediaTrackCapabilities | undefined
    ) => {
      if (!capabilities || !capabilities.width || !capabilities.height) {
        return { width: 3840, height: 2160 }
      }

      const widthCapability = capabilities.width as {
        min?: number
        max?: number
      }
      const heightCapability = capabilities.height as {
        min?: number
        max?: number
      }

      const maxWidth = widthCapability.max || 3840
      const maxHeight = heightCapability.max || 2160

      console.log(
        `Device maximum supported resolution: ${maxWidth}×${maxHeight}`
      )
      return { width: maxWidth, height: maxHeight }
    }

    const getCameras = async () => {
      try {
        const constraints = {
          video: selectedDeviceId
            ? {
                deviceId: { exact: selectedDeviceId },
                width: { ideal: 3840 },
                height: { ideal: 2160 },
              }
            : {
                width: { ideal: 3840 },
                height: { ideal: 2160 },
              },
        }

        console.log('Requesting camera with constraints:', constraints)
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        const track = stream.getVideoTracks()[0]

        const settings = track.getSettings()
        console.log('Actual camera settings:', settings)

        const capabilities = track.getCapabilities()
        console.log('Camera capabilities:', capabilities)

        const bestResolution = determineBestResolution(capabilities)
        console.log(
          `Best available resolution: ${bestResolution.width}×${bestResolution.height}`
        )

        setBestAvailableResolution(bestResolution)

        if (settings.width && settings.height) {
          console.log(
            `Camera initialized at: ${settings.width}×${settings.height}`
          )
          if (settings.width < 720 || settings.height < 720) {
            console.warn(
              `Camera resolution is lower than requested: ${settings.width}×${settings.height}`
            )
          }
        }

        stream.getTracks().forEach((t) => t.stop())

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices.filter((d) => d.kind === 'videoinput')
        console.log('Available video devices:', videoInputs)
        setVideoDevices(videoInputs)
        setSelectedDeviceId((prev) => prev || videoInputs[0]?.deviceId || null)
      } catch (err: unknown) {
        console.error('Camera access error:', err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        alert(`Failed to access camera: ${errorMessage}`)
      }
    }

    getCameras()
  }, [selectedDeviceId])

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(e.target.value)
    setWebcamKey((prev) => prev + 1)
  }

  // Upscale image by scale factor to simulate 300dpi (or better resolution)
  const upscaleImageTo300Dpi = (
    img: HTMLImageElement,
    scale = 2
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth * scale
    canvas.height = img.naturalHeight * scale
    const ctx = canvas.getContext('2d')!

    // Use "pixelated" imageSmoothingQuality for OCR clarity or 'high' for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw scaled image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  // Modify preprocessImage to accept already upscaled canvas or image
  const preprocessImage = (
    canvasOrImage: HTMLImageElement | HTMLCanvasElement
  ): HTMLCanvasElement => {
    let tempCanvas: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D

    if (canvasOrImage instanceof HTMLImageElement) {
      tempCanvas = document.createElement('canvas')
      ctx = tempCanvas.getContext('2d')!
      tempCanvas.width = canvasOrImage.naturalWidth
      tempCanvas.height = canvasOrImage.naturalHeight
      ctx.drawImage(canvasOrImage, 0, 0)
    } else {
      tempCanvas = canvasOrImage
      ctx = tempCanvas.getContext('2d')!
    }

    const imageData = ctx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    )
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const binary = avg > 160 ? 255 : 0
      data[i] = data[i + 1] = data[i + 2] = binary
    }

    ctx.putImageData(imageData, 0, 0)
    return tempCanvas
  }

  const drawCanvas = (wordsToDraw: WordBox[], selected: WordBox[] = []) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const image = imageRef.current
    if (!canvas || !ctx || !image) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0)

    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'red'
    wordsToDraw.forEach(({ bbox, text }) => {
      ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0)
      ctx.fillText(text, bbox.x0, bbox.y0 - 5)
    })

    ctx.strokeStyle = 'blue'
    selected.forEach(({ bbox }) => {
      ctx.strokeRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0)
    })
  }

  const captureAndRecognize = async () => {
    const videoElement = webcamRef.current?.video
    let actualWidth = bestAvailableResolution.width
    let actualHeight = bestAvailableResolution.height

    if (videoElement) {
      actualWidth = Math.max(
        videoElement.videoWidth,
        bestAvailableResolution.width
      )
      actualHeight = Math.max(
        videoElement.videoHeight,
        bestAvailableResolution.height
      )
      console.log(
        `Video element actual dimensions: ${videoElement.videoWidth}×${videoElement.videoHeight}`
      )
      console.log(
        `Using resolution for capture: ${actualWidth}×${actualHeight}`
      )
    }

    const screenshotDataUrl = webcamRef.current?.getScreenshot({
      width: actualWidth,
      height: actualHeight,
    })

    if (!screenshotDataUrl) {
      alert('Failed to capture screenshot. Please try again.')
      return
    }

    const tempImg = new Image()
    tempImg.src = screenshotDataUrl
    await tempImg.decode()
    console.log(
      `Captured image dimensions: ${tempImg.naturalWidth}×${tempImg.naturalHeight}`
    )

    setShowWebcam(false)
    setUploadedImage(null) // clear uploaded image if any

    const worker = await createWorker(['hun', 'eng'], 1, {
      logger: (m) => console.log(m),
    })

    await worker.setParameters({
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      tessedit_pageseg_mode: PSM.AUTO,
    })

    const image = new Image()
    image.src = screenshotDataUrl
    await image.decode()
    imageRef.current = image

    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    console.log(
      `Processing image with dimensions: ${image.naturalWidth}×${image.naturalHeight}`
    )

    if (image.naturalWidth < 720 || image.naturalHeight < 720) {
      console.warn('Low resolution image might affect OCR quality')
    }

    // const upscaledCanvas = upscaleImageTo300Dpi(image, 2) // 2x scale factor for ~300dpi
    // const preprocessedCanvas = preprocessImage(image)

    const ret = await worker.recognize(image, {}, { blocks: true })

    if (!ret.data.blocks || ret.data.blocks.length === 0) {
      alert(
        'No text was detected in the image. Try adjusting the lighting or camera position.'
      )
      await worker.terminate()
      return
    }

    const words = ret.data.blocks
      .flatMap((block) =>
        block.paragraphs.flatMap((paragraph) =>
          paragraph.lines.flatMap((line) => line.words)
        )
      )
      .map((word, i) => ({
        text: word.text,
        bbox: word.bbox,
        index: i,
      }))

    wordBoxesRef.current = words
    selectedWordsRef.current = []
    drawCanvas(words, [])

    await worker.terminate()
  }

  // New handler for image file upload
  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setUploadedImage(dataUrl)
      setShowWebcam(false)

      const image = new Image()
      image.src = dataUrl
      await image.decode()
      imageRef.current = image

      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight

      const preprocessedCanvas = preprocessImage(image)

      const worker = await createWorker(['hun', 'eng'], 1, {
        logger: (m) => console.log(m),
      })
      await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD,
      })

      const ret = await worker.recognize(
        preprocessedCanvas,
        {},
        { blocks: true }
      )

      if (!ret.data.blocks || ret.data.blocks.length === 0) {
        alert('No text detected. Please try another image.')
        await worker.terminate()
        return
      }

      const words = ret.data.blocks
        .flatMap((block) =>
          block.paragraphs.flatMap((paragraph) =>
            paragraph.lines.flatMap((line) => line.words)
          )
        )
        .map((word, i) => ({
          text: word.text,
          bbox: word.bbox,
          index: i,
        }))

      wordBoxesRef.current = words
      selectedWordsRef.current = []
      drawCanvas(words, [])

      await worker.terminate()
    }
    reader.readAsDataURL(file)
  }

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    const clicked = wordBoxesRef.current.find(({ bbox }) => {
      return x >= bbox.x0 && x <= bbox.x1 && y >= bbox.y0 && y <= bbox.y1
    })

    if (clicked) {
      const exists = selectedWordsRef.current.find(
        (w) => w.index === clicked.index
      )
      if (exists) {
        selectedWordsRef.current = selectedWordsRef.current.filter(
          (w) => w.index !== clicked.index
        )
      } else {
        selectedWordsRef.current = [...selectedWordsRef.current, clicked]
      }

      drawCanvas(wordBoxesRef.current, selectedWordsRef.current)
      forceUpdate((x) => x + 1)
    }
  }

  const ordered = [...selectedWordsRef.current].sort(
    (a, b) => a.index - b.index
  )
  const selectedText = ordered.map((w) => w.text).join(' ')

  const videoConstraints = {
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
    width: { ideal: bestAvailableResolution.width },
    height: { ideal: bestAvailableResolution.height },
    facingMode: 'environment',
  }

  const resetCapture = () => {
    setShowWebcam(true)
    setUploadedImage(null)
    wordBoxesRef.current = []
    selectedWordsRef.current = []
    setWebcamKey((prev) => prev + 1)
    forceUpdate((x) => x + 1)
  }

  return (
    <div>
      {showWebcam ? (
        <>
          <label>
            Select Camera:{' '}
            <select
              value={selectedDeviceId || ''}
              onChange={handleCameraChange}
            >
              {videoDevices.map((device, i) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Target resolution: Maximum available (requesting up to 4K/3840×2160)
          </div>
          <Webcam
            key={webcamKey}
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            videoConstraints={videoConstraints}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              marginTop: '0.5rem',
            }}
            forceScreenshotSourceSize={true}
            screenshotQuality={1}
            imageSmoothing={false}
            onUserMedia={(stream: MediaStream) => {
              const videoTrack = stream.getVideoTracks()[0]
              if (videoTrack) {
                const settings = videoTrack.getSettings()
                console.log(
                  'Actual camera settings after initialization:',
                  settings
                )
                if (settings.width && settings.height) {
                  const resolutionInfo = document.getElementById(
                    'camera-resolution-info'
                  )
                  if (resolutionInfo) {
                    resolutionInfo.textContent = `Active resolution: ${settings.width}×${settings.height}`
                  }
                }
              }
            }}
          />
          <div
            id="camera-resolution-info"
            style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}
          >
            Initializing camera...
          </div>
          <button onClick={captureAndRecognize} style={{ marginTop: '1rem' }}>
            Capture & OCR
          </button>
          <div style={{ marginTop: '1rem' }}>
            <label>
              Or upload image for OCR:{' '}
              <input type="file" accept="image/*" onChange={onImageUpload} />
            </label>
          </div>
        </>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            style={{
              minWidth: '100%',
              width: '100%',
              height: 'auto',
              marginTop: '1rem',
              cursor: 'pointer',
              display: 'block',
            }}
          />
          <p>
            <strong>Selected (in reading order):</strong>{' '}
            {selectedText || '[none]'}
          </p>
          <button onClick={resetCapture} style={{ marginTop: '1rem' }}>
            Retake
          </button>
        </>
      )}
    </div>
  )
}

export default TesseractDemo

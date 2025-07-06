import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { createWorker, PSM, OEM } from 'tesseract.js'
import cvReadyPromise from '@techstark/opencv-js'

interface WordBox {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  index: number
}

// Define OpenCV type to avoid TypeScript errors
let cv: any

// Utility to check if OpenCV is fully loaded and ready
const isOpenCvReady = () => {
  return (
    typeof cv !== 'undefined' && cv !== null && typeof cv.imread === 'function'
  )
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
  const [preprocessingMode, setPreprocessingMode] = useState<string>('adaptive')
  const [showPreprocessed, setShowPreprocessed] = useState<boolean>(false)
  const [preprocessedImageUrl, setPreprocessedImageUrl] = useState<
    string | null
  >(null)
  const [isOpenCvLoaded, setIsOpenCvLoaded] = useState<boolean>(false)
  const [, forceUpdate] = useState(0)

  // Helper function to properly dispose of canvases to prevent memory leaks
  const disposeCanvas = (canvas: HTMLCanvasElement | null): void => {
    if (!canvas) return

    // Clear the canvas content
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Remove any event listeners if they exist
    canvas.width = 0
    canvas.height = 0
  }

  // Load OpenCV asynchronously with better error handling
  useEffect(() => {
    const loadOpenCv = async () => {
      try {
        // Set a timeout to detect if loading takes too long
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OpenCV loading timeout')), 10000)
        })

        // Race between actual loading and timeout
        cv = await Promise.race([cvReadyPromise, timeoutPromise])

        if (cv && cv.imread) {
          console.log('OpenCV loaded successfully')
          setIsOpenCvLoaded(true)
        } else {
          throw new Error('OpenCV loaded but critical functions are missing')
        }
      } catch (err) {
        console.error('Error loading OpenCV:', err)
        // Don't show alert as it's disruptive - we'll show status in the UI instead
        console.warn('Falling back to basic image processing')
      }
    }

    loadOpenCv()
  }, [])

  // Check OpenCV loading status with retries and a timeout
  useEffect(() => {
    let checkAttempts = 0
    const maxAttempts = 10

    const checkOpenCvReady = () => {
      if (cv && cv.imread) {
        console.log('OpenCV.js is ready!')
        setIsOpenCvLoaded(true)
        return true
      } else {
        checkAttempts++
        if (checkAttempts < maxAttempts) {
          console.log(
            `Waiting for OpenCV.js... (attempt ${checkAttempts}/${maxAttempts})`
          )
          setTimeout(checkOpenCvReady, 1000)
          return false
        } else {
          console.warn('OpenCV.js failed to load after maximum attempts')
          return false
        }
      }
    }

    if (!isOpenCvLoaded) {
      checkOpenCvReady()
    }
  }, [isOpenCvLoaded])

  useEffect(() => {
    // Add status message when OpenCV is loaded
    if (isOpenCvLoaded) {
      console.log('OpenCV.js is fully loaded and ready')
      // You could update UI here to show OpenCV is active
    }
  }, [isOpenCvLoaded])

  // Effect to ensure canvas is redrawn when toggling between views
  useEffect(() => {
    if (
      !showPreprocessed &&
      wordBoxesRef.current.length > 0 &&
      imageRef.current
    ) {
      // Need a small delay to ensure canvas is ready
      const timer = setTimeout(() => {
        drawCanvas(wordBoxesRef.current, selectedWordsRef.current)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [showPreprocessed])

  // Additional fallback effect that runs if OpenCV isn't available after a delay
  useEffect(() => {
    if (!isOpenCvLoaded) {
      // Wait 5 seconds and try an alternative loading approach if OpenCV isn't ready
      const fallbackTimer = setTimeout(() => {
        if (!isOpenCvLoaded) {
          console.warn(
            'OpenCV failed to load normally, attempting fallback initialization'
          )

          // Create script element to load OpenCV.js manually
          try {
            // Check if the script is already in the document
            if (!document.getElementById('opencv-fallback-script')) {
              const script = document.createElement('script')
              script.id = 'opencv-fallback-script'
              script.src = 'https://docs.opencv.org/4.5.5/opencv.js'
              script.async = true
              script.onload = () => {
                console.log('OpenCV loaded via fallback method')
                if (typeof cv !== 'undefined' && cv && cv.imread) {
                  setIsOpenCvLoaded(true)
                }
              }
              script.onerror = (err) => {
                console.error('Fallback OpenCV loading failed:', err)
              }
              document.body.appendChild(script)
            }
          } catch (err) {
            console.error('Error in fallback OpenCV loading:', err)
          }
        }
      }, 5000)

      return () => clearTimeout(fallbackTimer)
    }
  }, [isOpenCvLoaded])

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
    let canvas = null
    let fallbackCanvas = null

    try {
      canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      const ctx = canvas.getContext('2d')!

      // Use "pixelated" imageSmoothingQuality for OCR clarity or 'high' for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      return canvas
    } catch (error) {
      console.error('Error during upscaling:', error)

      // Dispose of the failed canvas if it was created
      if (canvas) disposeCanvas(canvas)

      // Return a simple 1:1 canvas copy on error
      fallbackCanvas = document.createElement('canvas')
      fallbackCanvas.width = img.naturalWidth
      fallbackCanvas.height = img.naturalHeight
      const ctx = fallbackCanvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      return fallbackCanvas
    }
  }

  // Preprocessing with OpenCV.js - much faster and more powerful than manual processing
  const preprocessImage = (
    canvasOrImage: HTMLImageElement | HTMLCanvasElement,
    preprocessingMode = 'adaptive' // 'adaptive', 'binary', 'grayscale', 'sharpen', 'otsu'
  ): HTMLCanvasElement => {
    // Check if OpenCV is properly loaded
    const isOpenCvAvailable =
      typeof cv !== 'undefined' &&
      cv !== null &&
      typeof cv.imread === 'function'

    if (!isOpenCvAvailable) {
      console.warn('OpenCV not loaded, falling back to basic image processing')

      // Return a simple canvas with basic processing if OpenCV is not loaded
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')!

      if (canvasOrImage instanceof HTMLImageElement) {
        tempCanvas.width = canvasOrImage.naturalWidth
        tempCanvas.height = canvasOrImage.naturalHeight
        ctx.drawImage(canvasOrImage, 0, 0)
      } else {
        tempCanvas.width = canvasOrImage.width
        tempCanvas.height = canvasOrImage.height
        ctx.drawImage(canvasOrImage, 0, 0)
      }

      // Basic grayscale processing without OpenCV
      try {
        const imageData = ctx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        )
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg // red
          data[i + 1] = avg // green
          data[i + 2] = avg // blue
        }

        ctx.putImageData(imageData, 0, 0)
      } catch (err) {
        console.error('Error in basic image processing:', err)
      }

      return tempCanvas
    }

    try {
      // Create a canvas to draw the source image
      const sourceCanvas = document.createElement('canvas')
      const ctx = sourceCanvas.getContext('2d')!

      if (canvasOrImage instanceof HTMLImageElement) {
        sourceCanvas.width = canvasOrImage.naturalWidth
        sourceCanvas.height = canvasOrImage.naturalHeight
        ctx.drawImage(canvasOrImage, 0, 0)
      } else {
        sourceCanvas.width = canvasOrImage.width
        sourceCanvas.height = canvasOrImage.height
        ctx.drawImage(canvasOrImage, 0, 0)
      }

      // Convert image to OpenCV format
      const src = cv.imread(sourceCanvas)
      const dst = new cv.Mat()

      // Convert to grayscale (much faster with OpenCV)
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY)

      // Apply chosen preprocessing technique
      switch (preprocessingMode) {
        case 'binary': {
          // Simple binary threshold
          const threshold = 160
          cv.threshold(dst, dst, threshold, 255, cv.THRESH_BINARY)
          break
        }

        case 'otsu': {
          // Otsu's method automatically determines optimal threshold
          cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU)
          break
        }

        case 'adaptive': {
          // Advanced adaptive thresholding with morphological operations

          // First, denoise with a small Gaussian blur
          const tempMat = new cv.Mat()
          cv.GaussianBlur(dst, tempMat, new cv.Size(3, 3), 0)

          // Calculate adaptive block size based on image dimensions
          const blockSize = Math.floor(Math.min(dst.rows, dst.cols) / 20)
          // Make sure blockSize is odd
          const blockSizeAdjusted = Math.max(
            3,
            blockSize % 2 === 0 ? blockSize + 1 : blockSize
          )

          // Apply adaptive threshold (much better than manual implementation)
          cv.adaptiveThreshold(
            tempMat,
            dst,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C, // Gaussian is often better than MEAN
            cv.THRESH_BINARY,
            blockSizeAdjusted,
            10
          )

          // Create structuring element for morphological operations
          const kernelSize = new cv.Size(1, 1)
          const kernel = cv.getStructuringElement(cv.MORPH_RECT, kernelSize)

          // Morphological operations to clean up noise and improve text readability
          // This helps with filling in broken characters
          cv.morphologyEx(
            dst,
            dst,
            cv.MORPH_CLOSE,
            kernel,
            new cv.Point(-1, -1),
            1
          )

          // Clean up
          tempMat.delete()
          kernel.delete()
          break
        }

        case 'sharpen': {
          // Sharpening with OpenCV
          // Create kernel for sharpening
          const kernel = cv.Mat.zeros(3, 3, cv.CV_32F)
          kernel.floatPtr(0, 0)[0] = 0
          kernel.floatPtr(0, 1)[0] = -1
          kernel.floatPtr(0, 2)[0] = 0
          kernel.floatPtr(1, 0)[0] = -1
          kernel.floatPtr(1, 1)[0] = 5
          kernel.floatPtr(1, 2)[0] = -1
          kernel.floatPtr(2, 0)[0] = 0
          kernel.floatPtr(2, 1)[0] = -1
          kernel.floatPtr(2, 2)[0] = 0

          // Apply filter
          cv.filter2D(dst, dst, -1, kernel)
          kernel.delete()
          break
        }

        case 'grayscale':
        default: {
          // Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
          const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8))
          clahe.apply(dst, dst)
          clahe.delete()
          break
        }
      }

      // Additional noise reduction if needed
      // Gaussian blur can help reduce noise
      if (preprocessingMode === 'sharpen') {
        // Small blur to reduce noise after sharpening
        cv.GaussianBlur(dst, dst, new cv.Size(3, 3), 0)
      } // Convert back to display in canvas
      const outputCanvas = document.createElement('canvas')
      cv.imshow(outputCanvas, dst)

      // Clean up OpenCV objects to prevent memory leaks
      src.delete()
      dst.delete()

      // Clean up the source canvas to free memory
      disposeCanvas(sourceCanvas)

      return outputCanvas
    } catch (error) {
      console.error('OpenCV error during preprocessing:', error)

      // Fallback: Return original image on error
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')!

      if (canvasOrImage instanceof HTMLImageElement) {
        tempCanvas.width = canvasOrImage.naturalWidth
        tempCanvas.height = canvasOrImage.naturalHeight
        ctx.drawImage(canvasOrImage, 0, 0)
      } else {
        tempCanvas.width = canvasOrImage.width
        tempCanvas.height = canvasOrImage.height
        ctx.drawImage(canvasOrImage, 0, 0)
      }

      return tempCanvas
    }
  }

  const drawCanvas = (wordsToDraw: WordBox[], selected: WordBox[] = []) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const image = imageRef.current

    if (!canvas || !ctx || !image) {
      console.log('Cannot draw canvas - missing element:', {
        hasCanvas: !!canvas,
        hasContext: !!ctx,
        hasImage: !!image,
      })
      return
    }

    // Ensure canvas dimensions match the image
    if (
      canvas.width !== image.naturalWidth ||
      canvas.height !== image.naturalHeight
    ) {
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the image
    ctx.drawImage(image, 0, 0)

    // Calculate scaling factor if there's any difference between the preprocessed image and display
    // Tesseract may return coordinates based on a differently scaled version of the image
    const scaleX = canvas.width / image.naturalWidth
    const scaleY = canvas.height / image.naturalHeight

    // Draw bounding boxes for each word
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'red'

    wordsToDraw.forEach(({ bbox, text }) => {
      // Apply scaling to the bbox coordinates
      const x = bbox.x0 * scaleX
      const y = bbox.y0 * scaleY
      const width = (bbox.x1 - bbox.x0) * scaleX
      const height = (bbox.y1 - bbox.y0) * scaleY

      ctx.strokeRect(x, y, width, height)
      ctx.fillText(text, x, y - 5)
    })

    // Draw selected words with blue outline
    ctx.strokeStyle = 'blue'
    selected.forEach(({ bbox }) => {
      const x = bbox.x0 * scaleX
      const y = bbox.y0 * scaleY
      const width = (bbox.x1 - bbox.x0) * scaleX
      const height = (bbox.y1 - bbox.y0) * scaleY

      ctx.strokeRect(x, y, width, height)
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

    let worker
    let upscaledCanvas = null
    let preprocessedCanvas = null

    try {
      worker = await createWorker(['hun', 'eng'], 1, {
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

      // Try different preprocessing techniques
      console.log(`Using preprocessing mode: ${preprocessingMode}`)

      // Step 1: Upscale the image to improve OCR quality
      const upscaleFactor = 2 // Consistent scale factor for 300dpi
      upscaledCanvas = upscaleImageTo300Dpi(image, upscaleFactor)

      // Step 2: Apply chosen preprocessing technique
      preprocessedCanvas = preprocessImage(upscaledCanvas, preprocessingMode)

      // Save the preprocessed image for preview
      setPreprocessedImageUrl(preprocessedCanvas.toDataURL('image/png'))
      setShowPreprocessed(false)

      // Perform OCR on the preprocessed image
      const ret = await worker.recognize(
        preprocessedCanvas,
        {},
        { blocks: true }
      )

      if (!ret.data.blocks || ret.data.blocks.length === 0) {
        alert(
          'No text was detected in the image. Try adjusting the lighting or camera position.'
        )
        return
      }

      // Type definition for Tesseract.js blocks
      type Block = {
        paragraphs: Array<{
          lines: Array<{
            words: Array<{
              text: string
              bbox: { x0: number; y0: number; x1: number; y1: number }
            }>
          }>
        }>
      }

      // Use the same scale factor that was used for upscaling the image
      const scaleFactor = upscaleFactor

      // Convert Tesseract results to our WordBox format and adjust coordinates for the upscaling
      const words = ret.data.blocks
        .flatMap((block: Block) =>
          block.paragraphs.flatMap((paragraph: Block['paragraphs'][0]) =>
            paragraph.lines.flatMap(
              (line: Block['paragraphs'][0]['lines'][0]) => line.words
            )
          )
        )
        .map(
          (
            word: {
              text: string
              bbox: { x0: number; y0: number; x1: number; y1: number }
            },
            i: number
          ) => ({
            text: word.text,
            // Scale down the bbox coordinates to match the original image size
            bbox: {
              x0: Math.round(word.bbox.x0 / scaleFactor),
              y0: Math.round(word.bbox.y0 / scaleFactor),
              x1: Math.round(word.bbox.x1 / scaleFactor),
              y1: Math.round(word.bbox.y1 / scaleFactor),
            },
            index: i,
          })
        )

      wordBoxesRef.current = words
      selectedWordsRef.current = []
      drawCanvas(words, [])
    } finally {
      // Clean up resources
      if (worker) await worker.terminate()
      if (upscaledCanvas) disposeCanvas(upscaledCanvas)
      if (preprocessedCanvas) disposeCanvas(preprocessedCanvas)

      // Clean up temporary image
      if (tempImg) {
        tempImg.onload = null
        tempImg.onerror = null
      }
    }
  }

  // New handler for image file upload with improved reliability
  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image upload triggered')
    const file = e.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name, file.type, file.size)

    // Clean up first - important for reliable operation
    if (preprocessedImageUrl) {
      URL.revokeObjectURL(
        preprocessedImageUrl.startsWith('blob:') ? preprocessedImageUrl : ''
      )
    }

    // Reset any previous processing state
    wordBoxesRef.current = []
    selectedWordsRef.current = []
    setPreprocessedImageUrl(null)

    let upscaledCanvas = null
    let preprocessedCanvas = null
    let worker = null

    try {
      // Read file as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (e) => {
          console.error('Error reading file:', e)
          reject(new Error('Failed to read file'))
        }
        reader.readAsDataURL(file)
      })

      console.log('File read successfully, image loading...')
      setUploadedImage(dataUrl)
      setShowWebcam(false)
      setShowPreprocessed(false)

      // Load image with proper error handling
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = (e) => {
          console.error('Error loading image:', e)
          reject(new Error('Failed to load image'))
        }
        img.src = dataUrl
      })

      console.log(
        `Image loaded successfully: ${image.naturalWidth}x${image.naturalHeight}`
      )

      // Store the image in the ref
      imageRef.current = image

      const canvas = canvasRef.current
      if (!canvas) {
        console.error('Canvas reference not available')
        return
      }

      // Set canvas dimensions
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`)

      // Step 1: Upscale the image to improve OCR quality
      console.log('Starting image upscaling...')
      const upscaleFactor = 2 // Explicit scale factor for 300dpi
      upscaledCanvas = upscaleImageTo300Dpi(image, upscaleFactor)
      console.log('Image upscaled successfully')

      // Step 2: Apply the user-selected preprocessing method
      console.log(
        `Using preprocessing mode for uploaded image: ${preprocessingMode}`
      )
      preprocessedCanvas = preprocessImage(upscaledCanvas, preprocessingMode)
      console.log('Preprocessing completed successfully')

      // Save the preprocessed image for preview
      setPreprocessedImageUrl(preprocessedCanvas.toDataURL('image/png'))
      setShowPreprocessed(false)

      worker = await createWorker(['hun', 'eng'], 1, {
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
        return
      }

      // Type definition for Tesseract.js blocks
      type Block = {
        paragraphs: Array<{
          lines: Array<{
            words: Array<{
              text: string
              bbox: { x0: number; y0: number; x1: number; y1: number }
            }>
          }>
        }>
      }

      // Use the same scale factor that was used for upscaling the image
      const scaleFactor = upscaleFactor

      // Convert Tesseract results to our WordBox format and adjust coordinates for the upscaling
      const words = ret.data.blocks
        .flatMap((block: Block) =>
          block.paragraphs.flatMap((paragraph: Block['paragraphs'][0]) =>
            paragraph.lines.flatMap(
              (line: Block['paragraphs'][0]['lines'][0]) => line.words
            )
          )
        )
        .map(
          (
            word: {
              text: string
              bbox: { x0: number; y0: number; x1: number; y1: number }
            },
            i: number
          ) => ({
            text: word.text,
            // Scale down the bbox coordinates to match the original image size
            bbox: {
              x0: Math.round(word.bbox.x0 / scaleFactor),
              y0: Math.round(word.bbox.y0 / scaleFactor),
              x1: Math.round(word.bbox.x1 / scaleFactor),
              y1: Math.round(word.bbox.y1 / scaleFactor),
            },
            index: i,
          })
        )

      wordBoxesRef.current = words
      selectedWordsRef.current = []
      drawCanvas(words, [])
    } catch (error) {
      console.error('Error processing image:', error)
      alert(
        'Failed to process image. Please try again or use a different image.'
      )
    } finally {
      // Clean up worker
      if (worker) await worker.terminate()
      // Clean up canvases to prevent memory leaks
      disposeCanvas(upscaledCanvas)
      disposeCanvas(preprocessedCanvas)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    // Get click coordinates in canvas space
    const rect = canvas.getBoundingClientRect()
    const displayScaleX = canvas.width / rect.width
    const displayScaleY = canvas.height / rect.height

    const canvasX = (event.clientX - rect.left) * displayScaleX
    const canvasY = (event.clientY - rect.top) * displayScaleY

    // Calculate scaling factor between image and Tesseract coordinates
    const imageScaleX = canvas.width / image.naturalWidth
    const imageScaleY = canvas.height / image.naturalHeight

    // Find the word that was clicked, accounting for the scaling
    const clicked = wordBoxesRef.current.find(({ bbox }) => {
      // Scale the bbox coordinates to match the canvas
      const x0 = bbox.x0 * imageScaleX
      const y0 = bbox.y0 * imageScaleY
      const x1 = bbox.x1 * imageScaleX
      const y1 = bbox.y1 * imageScaleY

      return canvasX >= x0 && canvasX <= x1 && canvasY >= y0 && canvasY <= y1
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
    console.log('Resetting capture state')

    // Clean up any existing preprocessed image
    if (preprocessedImageUrl) {
      // Clear the URL to allow garbage collection
      URL.revokeObjectURL(
        preprocessedImageUrl.startsWith('blob:') ? preprocessedImageUrl : ''
      )
      setPreprocessedImageUrl(null)
    }

    // Clear the image reference to ensure proper reinitialization
    if (imageRef.current) {
      // Release image resources
      imageRef.current.src = ''
      imageRef.current = null
    }

    // Clear canvas if it exists
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      // Reset canvas dimensions
      canvas.width = 1
      canvas.height = 1
    }

    // Reset states
    setShowWebcam(true)
    setUploadedImage(null)
    setShowPreprocessed(false)
    wordBoxesRef.current = []
    selectedWordsRef.current = []

    // Reset the webcam component
    setWebcamKey((prev) => prev + 1)

    // Try to find and reset the file input manually
    try {
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach((input) => {
        if (input instanceof HTMLInputElement) {
          input.value = ''
        }
      })
    } catch (err) {
      console.warn('Could not reset file input element:', err)
    }

    // Force re-render to ensure UI updates
    forceUpdate((x) => x + 1)

    console.log('Capture state reset complete')
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
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              Preprocessing mode:{' '}
              <select
                value={preprocessingMode}
                onChange={(e) => setPreprocessingMode(e.target.value)}
              >
                <option value="adaptive">
                  Adaptive threshold (best for varying lighting)
                </option>
                <option value="otsu">
                  Otsu threshold (automatic optimal threshold)
                </option>
                <option value="binary">Binary threshold (high contrast)</option>
                <option value="grayscale">CLAHE contrast enhancement</option>
                <option value="sharpen">
                  Sharpening filter (enhances details)
                </option>
              </select>
            </label>
            <div style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
              Different preprocessing techniques work better for different
              images. Try them all for best results.
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                marginTop: '0.4rem',
                color: isOpenCvLoaded ? 'green' : 'orange',
                fontWeight: 'bold',
              }}
            >
              {isOpenCvLoaded
                ? 'Using OpenCV.js for high-performance image processing'
                : 'OpenCV.js is loading or failed to load. Using basic processing. You may need to refresh the page.'}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>
              Or upload image for OCR:{' '}
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                // Add a key to ensure the input is re-rendered when resetting
                key={`file-input-${webcamKey}`}
                id="ocr-file-input"
                onClick={(e) => {
                  // Reset the input value to ensure onChange fires even with the same file
                  ;(e.target as HTMLInputElement).value = ''
                  console.log('File input cleared on click')
                }}
              />
            </label>
            <button
              onClick={() => {
                const fileInput = document.getElementById(
                  'ocr-file-input'
                ) as HTMLInputElement
                if (fileInput) {
                  fileInput.click()
                }
              }}
              style={{ marginLeft: '8px' }}
            >
              Browse Files
            </button>
            <div
              style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: 'gray' }}
            >
              If the same file doesn't work on retake, try selecting a different
              file first.
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                setShowPreprocessed(false)
                // Redraw the canvas when switching back to original view
                setTimeout(() => {
                  drawCanvas(wordBoxesRef.current, selectedWordsRef.current)
                }, 0)
              }}
              style={{
                fontWeight: !showPreprocessed ? 'bold' : 'normal',
                backgroundColor: !showPreprocessed ? '#e0e0e0' : 'transparent',
              }}
            >
              Original Image
            </button>
            <button
              onClick={() => setShowPreprocessed(true)}
              style={{
                fontWeight: showPreprocessed ? 'bold' : 'normal',
                backgroundColor: showPreprocessed ? '#e0e0e0' : 'transparent',
              }}
              disabled={!preprocessedImageUrl}
            >
              Preprocessed Image ({preprocessingMode})
            </button>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            {/* Always keep the canvas in the DOM but toggle its visibility */}
            <canvas
              ref={canvasRef}
              onClick={handleClick}
              style={{
                minWidth: '100%',
                width: '100%',
                height: 'auto',
                marginTop: '0.5rem',
                cursor: 'pointer',
                display: showPreprocessed ? 'none' : 'block',
              }}
            />

            {/* Show preprocessed image when selected */}
            {showPreprocessed && preprocessedImageUrl && (
              <img
                src={preprocessedImageUrl}
                alt="Preprocessed"
                style={{
                  minWidth: '100%',
                  width: '100%',
                  height: 'auto',
                  marginTop: '0.5rem',
                  display: 'block',
                }}
              />
            )}
          </div>

          <p>
            <strong>Selected (in reading order):</strong>{' '}
            {selectedText || '[none]'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={resetCapture}>Retake</button>
            <button
              onClick={() => {
                // Reset first to clear state
                resetCapture()

                // Short delay to ensure the reset completed before opening file dialog
                setTimeout(() => {
                  const fileInput = document.getElementById(
                    'ocr-file-input'
                  ) as HTMLInputElement
                  if (fileInput) {
                    // Clear any existing value and trigger file dialog
                    fileInput.value = ''
                    fileInput.click()
                  }
                }, 100)
              }}
            >
              Upload New Image
            </button>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              color: isOpenCvLoaded ? 'green' : 'orange',
            }}
          >
            {isOpenCvLoaded
              ? 'Using OpenCV.js for high-performance image processing'
              : 'OpenCV.js is loading or failed to load. Using basic processing. You may need to refresh the page.'}
          </div>
        </>
      )}
    </div>
  )
}

export default TesseractDemo

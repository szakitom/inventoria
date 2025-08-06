import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { createWorker, PSM, OEM } from 'tesseract.js'
import cvReadyPromise from '@techstark/opencv-js'

interface WordBox {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  index: number
  confidence: number
}

// Use 'any' type to avoid TypeScript errors with the OpenCV library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cv: any

const TesseractDemo = () => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const wordBoxesRef = useRef<WordBox[]>([])
  const selectedWordsRef = useRef<WordBox[]>([])

  // Array of available video devices, currently not displayed in UI but used in the camera selection logic
  const [, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [webcamKey, setWebcamKey] = useState(0)
  const [showWebcam, setShowWebcam] = useState(true)
  const [bestAvailableResolution, setBestAvailableResolution] = useState({
    width: 3840,
    height: 2160,
  })

  // Display state is controlled via uploaded image URL
  const [, setUploadedImage] = useState<string | null>(null)
  const [preprocessingMode, setPreprocessingMode] = useState<string>('adaptive')
  const [psmMode, setPsmMode] = useState<PSM>(PSM.SPARSE_TEXT_OSD)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70)

  const [showPreprocessed, setShowPreprocessed] = useState<boolean>(false)
  const [preprocessedImageUrl, setPreprocessedImageUrl] = useState<
    string | null
  >(null)
  const [isOpenCvLoaded, setIsOpenCvLoaded] = useState<boolean>(false)
  const [, forceUpdate] = useState(0)

  // -- OpenCV Loader --
  useEffect(() => {
    const loadOpenCv = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('OpenCV loading timeout')), 10000)
        )
        cv = await Promise.race([cvReadyPromise, timeoutPromise])
        if (cv && cv.imread) {
          console.log('OpenCV loaded successfully')
          setIsOpenCvLoaded(true)
        } else {
          throw new Error('OpenCV missing critical functions')
        }
      } catch (err) {
        console.error('Error loading OpenCV:', err)
      }
    }
    loadOpenCv()
  }, [])
  // Check OpenCV readiness fallback
  useEffect(() => {
    if (!isOpenCvLoaded) {
      const fallbackTimer = setTimeout(() => {
        if (!isOpenCvLoaded) {
          const script = document.createElement('script')
          script.src = 'https://docs.opencv.org/4.5.5/opencv.js'
          script.async = true
          script.onload = () => {
            if (typeof cv !== 'undefined' && cv?.imread) {
              console.log('OpenCV loaded via fallback script')
              setIsOpenCvLoaded(true)
            }
          }
          script.onerror = (err) => {
            console.error('Fallback OpenCV load failed:', err)
          }
          document.body.appendChild(script)
        }
      }, 5000)
      return () => clearTimeout(fallbackTimer)
    }
  }, [isOpenCvLoaded])

  useEffect(() => {
    const getCameras = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedDeviceId
            ? {
                deviceId: { exact: selectedDeviceId },
                width: { ideal: 3840 },
                height: { ideal: 2160 },
              }
            : { width: { ideal: 3840 }, height: { ideal: 2160 } },
        })

        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        setBestAvailableResolution({
          width: capabilities.width?.max || 3840,
          height: capabilities.height?.max || 2160,
        })
        stream.getTracks().forEach((t) => t.stop())

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices.filter((d) => d.kind === 'videoinput')
        setVideoDevices(videoInputs)
        setSelectedDeviceId((prev) => prev || videoInputs[0]?.deviceId || null)
      } catch (err) {
        console.error('Camera error:', err)
      }
    }
    getCameras()
  }, [selectedDeviceId])

  const upscaleImage = (
    img: HTMLImageElement,
    scale = 2
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth * scale
    canvas.height = img.naturalHeight * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.warn('Upscale: 2D context not available')
      return canvas
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  const preprocessImage = (
    input: HTMLCanvasElement,
    mode: string
  ): HTMLCanvasElement => {
    if (!isOpenCvLoaded || !cv?.imread) return input

    try {
      const src = cv.imread(input)
      const dst = new cv.Mat()
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY)

      if (mode === 'adaptive-denoise') {
        const blur = new cv.Mat()
        cv.GaussianBlur(dst, blur, new cv.Size(3, 3), 0)
        const blockSize = Math.max(
          3,
          Math.floor(Math.min(dst.rows, dst.cols) / 20) | 1
        )
        cv.adaptiveThreshold(
          blur,
          dst,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          cv.THRESH_BINARY,
          blockSize,
          10
        )
        cv.medianBlur(dst, dst, 3)
        const kernel = cv.getStructuringElement(
          cv.MORPH_RECT,
          new cv.Size(1, 1)
        )
        cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel)
        blur.delete()
        kernel.delete()
      }

      const resultCanvas = document.createElement('canvas')
      cv.imshow(resultCanvas, dst)
      src.delete()
      dst.delete()
      return resultCanvas
    } catch (e) {
      console.error('Preprocessing error:', e)
      return input
    }
  }
  const runOcr = async (canvas: HTMLCanvasElement, scaleFactor = 2) => {
    const worker = await createWorker(['hun', 'eng'], 1, {
      logger: (m) => console.log(m),
    })

    await worker.setParameters({
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      // Cast psmMode to number for compatibility with Tesseract API
      tessedit_pageseg_mode: psmMode as unknown as PSM,
      tessedit_char_whitelist:
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    })

    const result = await worker.recognize(canvas, {}, { blocks: true })
    await worker.terminate()

    const words: WordBox[] =
      result.data.blocks?.flatMap((block) =>
        block.paragraphs.flatMap((p) =>
          p.lines.flatMap((line) =>
            line.words.map((word, index) => ({
              text: word.text,
              bbox: {
                x0: Math.round(word.bbox.x0 / scaleFactor),
                y0: Math.round(word.bbox.y0 / scaleFactor),
                x1: Math.round(word.bbox.x1 / scaleFactor),
                y1: Math.round(word.bbox.y1 / scaleFactor),
              },
              index,
              confidence: word.confidence,
            }))
          )
        )
      ) || []

    const filtered = words.filter((w) => w.confidence > confidenceThreshold)
    wordBoxesRef.current = filtered
    selectedWordsRef.current = []
    drawCanvas(filtered, [])
  }

  const drawCanvas = (words: WordBox[], selected: WordBox[]) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const image = imageRef.current
    if (!canvas || !ctx || !image) {
      console.warn('Cannot draw — missing canvas/image/context')
      return
    }

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0)

    const scaleX = canvas.width / image.naturalWidth
    const scaleY = canvas.height / image.naturalHeight

    for (const { bbox, text, confidence } of words) {
      const x = bbox.x0 * scaleX
      const y = bbox.y0 * scaleY
      const w = (bbox.x1 - bbox.x0) * scaleX
      const h = (bbox.y1 - bbox.y0) * scaleY
      ctx.strokeStyle = confidence < 80 ? 'orange' : 'red'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)
      ctx.fillStyle = 'black'
      ctx.fillText(text, x, y - 5)
    }

    ctx.strokeStyle = 'blue'
    for (const { bbox } of selected) {
      const x = bbox.x0 * scaleX
      const y = bbox.y0 * scaleY
      const w = (bbox.x1 - bbox.x0) * scaleX
      const h = (bbox.y1 - bbox.y0) * scaleY
      ctx.strokeRect(x, y, w, h)
    }
  }
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const img = new Image()
      img.src = reader.result as string
      await img.decode()
      imageRef.current = img
      setUploadedImage(img.src)
      setShowWebcam(false)

      const upscaled = upscaleImage(img, 2)
      const preprocessed = preprocessImage(upscaled, preprocessingMode)
      setPreprocessedImageUrl(preprocessed.toDataURL('image/png'))
      setShowPreprocessed(false)
      await runOcr(preprocessed)
    }
    reader.readAsDataURL(file)
  }

  const captureFromWebcam = async () => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (!screenshot) return

    const img = new Image()
    img.src = screenshot
    await img.decode()
    imageRef.current = img
    setShowWebcam(false)

    const upscaled = upscaleImage(img, 2)
    const preprocessed = preprocessImage(upscaled, preprocessingMode)
    setPreprocessedImageUrl(preprocessed.toDataURL('image/png'))
    setShowPreprocessed(false)
    await runOcr(preprocessed)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const clicked = wordBoxesRef.current.find(({ bbox }) => {
      return x >= bbox.x0 && x <= bbox.x1 && y >= bbox.y0 && y <= bbox.y1
    })

    if (clicked) {
      const exists = selectedWordsRef.current.some(
        (w) => w.index === clicked.index
      )
      if (exists) {
        selectedWordsRef.current = selectedWordsRef.current.filter(
          (w) => w.index !== clicked.index
        )
      } else {
        selectedWordsRef.current.push(clicked)
      }
      drawCanvas(wordBoxesRef.current, selectedWordsRef.current)
      forceUpdate((x) => x + 1)
    }
  }

  const selectedText = selectedWordsRef.current
    .sort((a, b) => a.index - b.index)
    .map((w) => w.text)
    .join(' ')

  const reset = () => {
    setShowWebcam(true)
    setUploadedImage(null)
    setPreprocessedImageUrl(null)
    selectedWordsRef.current = []
    wordBoxesRef.current = []
    setWebcamKey((k) => k + 1)
    forceUpdate((x) => x + 1)
  }

  return (
    <div className="p-4 space-y-4">
      {showWebcam ? (
        <>
          <Webcam
            key={webcamKey}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={{
              deviceId: selectedDeviceId
                ? { exact: selectedDeviceId }
                : undefined,
              facingMode: 'environment',
              width: bestAvailableResolution.width,
              height: bestAvailableResolution.height,
            }}
            className="rounded shadow-md"
          />
          <button
            onClick={captureFromWebcam}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Capture from Webcam
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-2">
            <button onClick={() => setShowPreprocessed(false)}>Original</button>
            <button
              onClick={() => setShowPreprocessed(true)}
              disabled={!preprocessedImageUrl}
            >
              Preprocessed
            </button>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              style={{
                display: showPreprocessed ? 'none' : 'block',
                width: '100%',
              }}
              onClick={handleCanvasClick}
            />
            {showPreprocessed && preprocessedImageUrl && (
              <img src={preprocessedImageUrl} style={{ width: '100%' }} />
            )}
          </div>
          <p>
            <strong>Selected Text:</strong> {selectedText || '[none]'}
          </p>
          <button onClick={reset}>Retake</button>
        </>
      )}

      <div className="space-y-2">
        <label>
          Preprocessing Mode:
          <select
            value={preprocessingMode}
            onChange={(e) => setPreprocessingMode(e.target.value)}
          >
            <option value="adaptive">Adaptive</option>
            <option value="adaptive-denoise">Adaptive + Denoise</option>
            <option value="otsu">Otsu</option>
            <option value="binary">Binary</option>
            <option value="grayscale">CLAHE</option>
          </select>
        </label>

        <label>
          PSM Mode:
          <select
            value={String(psmMode)}
            onChange={(e) =>
              setPsmMode(Number(e.target.value) as unknown as PSM)
            }
          >
            {Object.entries(PSM)
              .filter(([, v]) => typeof v === 'number')
              .map(([name, val]) => (
                <option key={String(val)} value={String(val)}>
                  {String(val)} - {name}
                </option>
              ))}
          </select>
        </label>

        <label>
          Confidence Threshold:
          <input
            type="number"
            min="0"
            max="100"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="ml-2 w-16"
          />
        </label>

        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>
    </div>
  )
}

export default TesseractDemo

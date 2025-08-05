import { createFileRoute } from '@tanstack/react-router'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import Quagga from '@ericblade/quagga2'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

const useCameras = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        stream.getTracks().forEach((track) => track.stop())
        const devices = await navigator.mediaDevices.enumerateDevices()

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        )
        if (videoDevices.length > 0) {
          const backCamera = videoDevices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
          )
          const selectedCamera = backCamera
            ? backCamera.deviceId
            : videoDevices[0].deviceId
          setSelectedCamera(selectedCamera)
          setDevices(videoDevices)
        }
      } catch (error) {
        console.error('Error fetching cameras:', error)
      }
    }

    fetchDevices()
  }, [])

  return { devices, selected: selectedCamera, setSelected: setSelectedCamera }
}

const getMedianOfCodeErrors = (decodedCodes) => {
  const errors = decodedCodes
    .map((x) => x.error)
    .filter((e) => typeof e === 'number') // filter out undefined/null

  if (errors.length === 0) return 1 // fallback: assume worst case

  errors.sort((a, b) => a - b)
  const mid = Math.floor(errors.length / 2)

  return errors.length % 2 === 0
    ? (errors[mid - 1] + errors[mid]) / 2
    : errors[mid]
}

const decoders = ['code_128_reader', 'ean_reader', 'ean_8_reader']

const BarcodeScanner = ({ onDetected, scannerRef, cameraId }) => {
  const errorCheck = useCallback(
    (result) => {
      if (!onDetected) {
        return
      }
      const err = getMedianOfCodeErrors(result.codeResult.decodedCodes)
      if (err < 0.1) {
        onDetected(result.codeResult.code)
      }
    },
    [onDetected]
  )

  const handleProcessed = (result) => {
    const drawingCtx = Quagga.canvas.ctx.overlay
    const drawingCanvas = Quagga.canvas.dom.overlay

    if (result) {
      console.warn('* quagga onProcessed', result)

      if (result.boxes) {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)

        result.boxes
          .filter((box) => box !== result.box)
          .forEach((box) => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
              color: 'purple',
              lineWidth: 2,
            })
          })
      }
      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
          color: 'green',
          lineWidth: 2,
        })
      }
    }
  }

  console.log(navigator.mediaDevices.getSupportedConstraints())

  useLayoutEffect(() => {
    let initialized = false

    const init = async () => {
      try {
        if (!scannerRef || !scannerRef.current) return
        await new Promise((resolve) => setTimeout(resolve, 1))
        if (initialized) return

        await Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              constraints: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
                ...(cameraId && { deviceId: cameraId }),
                ...(!cameraId && { facingMode: 'environment' }),
              },
              target: scannerRef.current,
              willReadFrequently: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            locator: {
              patchSize: 'medium',
              halfSample: true,
            },
            decoder: { readers: decoders },
            locate: true,
          },
          async (err) => {
            Quagga.onProcessed(handleProcessed)
            if (err) {
              return console.error('Error starting Quagga:', err)
            }
            if (scannerRef && scannerRef.current) {
              await Quagga.start()
            }
          }
        )
        Quagga.onDetected(errorCheck)
        initialized = true
      } catch (error) {
        console.error('Error initializing Quagga:', error)
      }
    }
    init()
    return () => {
      initialized = false
      Quagga.stop()
      Quagga.CameraAccess.release()
    }
  }, [cameraId, onDetected, scannerRef, errorCheck])
  return null
}

const Scanner = () => {
  const { devices, selected } = useCameras()
  const [isTorchOn, setTorch] = useState(false)
  const [scanning, setScanning] = useState(true)
  const [results, setResults] = useState([])

  const scannerRef = useRef()

  const onTorchClick = useCallback(async () => {
    if (isTorchOn) {
      await Quagga.CameraAccess.disableTorch()
    } else {
      await Quagga.CameraAccess.enableTorch()
    }
    setTorch(!isTorchOn)
  }, [isTorchOn, setTorch])

  if (devices.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <button onClick={onTorchClick}>
        {isTorchOn ? 'Disable Torch' : 'Enable Torch'}
      </button>

      <button onClick={() => setScanning(!scanning)}>
        {scanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
      <div>
        {results.map((result, index) => (
          <div key={index} className="text-green-500">
            {JSON.stringify(result)}
          </div>
        ))}
      </div>
      <div
        ref={scannerRef}
        className="h-[400px] aspect-square relative border-4 border-red-500"
      >
        <video
          style={{ backgroundColor: 'green', width: '100%', height: '100%' }}
        />
        <canvas
          className="drawingBuffer"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {scanning ? (
          <BarcodeScanner
            scannerRef={scannerRef}
            cameraId={selected}
            onDetected={(result) => setResults([...results, result])}
          />
        ) : null}
      </div>
    </div>
  )
}

function RouteComponent() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div>
        <button onClick={() => setOpen(!open)}>
          {open ? 'Close Scanner' : 'Open Scanner'}
        </button>
      </div>
      {open && <Scanner />}
    </div>
  )
}

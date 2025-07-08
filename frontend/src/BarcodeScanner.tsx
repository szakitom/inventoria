import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatOneDReader, IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'

interface BarcodeScannerProps {
  onBarcode: (value: string) => void
}

const BarcodeScanner = ({ onBarcode }: BarcodeScannerProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [scanningStopped, setScanningStopped] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)

  const releaseCamera = () => {
    if (controlsRef.current) {
      console.log('Stopping ZXing reader controls')
      controlsRef.current.stop()
      controlsRef.current = null
    }

    if (streamRef.current) {
      console.log('Stopping all media tracks in the stream')
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log(`Track ${track.id} stopped:`, track.readyState)
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      console.log('Clearing video srcObject')
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log('Fetching available cameras...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        stream.getTracks().forEach((track) => track.stop())

        const cameraDevices =
          await BrowserMultiFormatOneDReader.listVideoInputDevices()
        console.log('Available cameras:', cameraDevices)

        setDevices(cameraDevices)

        if (cameraDevices.length > 0) {
          const backCamera = cameraDevices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
          )

          setSelectedCamera(
            backCamera ? backCamera.deviceId : cameraDevices[0].deviceId
          )
        }
      } catch (err) {
        console.error('Failed to list cameras:', err)
      }
    }

    fetchCameras()
    return releaseCamera
  }, [])

  useEffect(() => {
    if (!selectedCamera || !videoRef.current || scanningStopped) return

    releaseCamera()

    console.log('Setting up camera with device ID:', selectedCamera)

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.ITF,
      BarcodeFormat.RSS_EXPANDED,
      BarcodeFormat.RSS_14,
      BarcodeFormat.QR_CODE, // optional
    ])

    const reader = new BrowserMultiFormatOneDReader(hints)

    const setupCamera = async () => {
      try {
        console.log('Getting user media for device:', selectedCamera)
        const constraints = {
          video: {
            deviceId: { exact: selectedCamera },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        console.log('Starting barcode reader')

        let barcodeHandled = false

        controlsRef.current = await reader.decodeFromVideoDevice(
          selectedCamera,
          videoRef.current!,
          (result) => {
            if (result && !barcodeHandled) {
              barcodeHandled = true
              console.log('Barcode detected:', result.getText())
              onBarcode(result.getText())
              setScanningStopped(true)
              releaseCamera()
            }
          }
        )
      } catch (err) {
        console.error('Failed to initialize camera or barcode reader:', err)
      }
    }

    setupCamera()
    return releaseCamera
  }, [selectedCamera, onBarcode, scanningStopped])

  return (
    <div className="scanner-container">
      <div className="camera-select">
        <label htmlFor="camera-select">Select Camera: </label>
        <select
          id="camera-select"
          onChange={(e) => setSelectedCamera(e.target.value)}
          value={selectedCamera || ''}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>

        {devices.length > 1 && (
          <button
            onClick={() => {
              const currentIndex = devices.findIndex(
                (d) => d.deviceId === selectedCamera
              )
              const nextIndex = (currentIndex + 1) % devices.length
              setSelectedCamera(devices[nextIndex].deviceId)
            }}
            style={{ marginLeft: '10px' }}
          >
            Switch Camera
          </button>
        )}
      </div>

      {selectedCamera && (
        <div className="video-container">
          <video
            ref={videoRef}
            style={{ height: '50%', width: 'auto', marginTop: '1rem' }}
            muted
            autoPlay
            playsInline
          />
        </div>
      )}
    </div>
  )
}

export default BarcodeScanner

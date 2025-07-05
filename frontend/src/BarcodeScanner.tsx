import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatOneDReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'

interface BarcodeScannerProps {
  onBarcode: (value: string) => void
}

const BarcodeScanner = ({ onBarcode }: BarcodeScannerProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  // Helper function to stop and release all camera resources
  const releaseCamera = () => {
    // First, stop the ZXing reader controls if they exist
    if (controlsRef.current) {
      console.log('Stopping ZXing reader controls')
      controlsRef.current.stop()
      controlsRef.current = null
    }

    // Then stop all media tracks if we have a stream
    if (streamRef.current) {
      console.log('Stopping all media tracks in the stream')
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log(`Track ${track.id} stopped:`, track.readyState)
      })
      streamRef.current = null
    }

    // Clear the video srcObject
    if (videoRef.current) {
      console.log('Clearing video srcObject')
      videoRef.current.srcObject = null
    }
  }

  // Load the available cameras when component mounts
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log('Fetching available cameras...')
        // Get user media access first to prompt for permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })

        // Stop this initial stream immediately after getting permission
        stream.getTracks().forEach((track) => track.stop())

        // Now list the available video devices
        const cameraDevices =
          await BrowserMultiFormatOneDReader.listVideoInputDevices()
        console.log('Available cameras:', cameraDevices)

        setDevices(cameraDevices)
        if (cameraDevices.length > 0) {
          // Try to find a back-facing camera by looking at labels
          const backCamera = cameraDevices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
          )

          // Use the back camera if found, otherwise use the first camera
          setSelectedCamera(
            backCamera ? backCamera.deviceId : cameraDevices[0].deviceId
          )
        }
      } catch (err) {
        console.error('Failed to list cameras:', err)
      }
    }

    fetchCameras()

    // Clean up all resources when component unmounts
    return releaseCamera
  }, [])

  // Set up and manage the camera when the selected camera changes
  useEffect(() => {
    if (!selectedCamera || !videoRef.current) return

    // Clean up existing resources before setting up new ones
    releaseCamera()

    console.log('Setting up camera with device ID:', selectedCamera)

    // Set up the barcode reader with hints
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.CODE_128,
    ])

    const reader = new BrowserMultiFormatOneDReader(hints)

    const setupCamera = async () => {
      try {
        // First get the media stream directly
        console.log('Getting user media for device:', selectedCamera)
        const constraints = {
          video: selectedCamera
            ? {
                deviceId: { exact: selectedCamera },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : {
                facingMode: { exact: 'environment' }, // Force back camera if no device selected
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        // Store the stream reference for cleanup
        streamRef.current = stream

        // Set the stream as the video source
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Now start the barcode reader
        console.log('Starting barcode reader')
        controlsRef.current = await reader.decodeFromVideoDevice(
          selectedCamera,
          videoRef.current!,
          (result) => {
            if (result) {
              console.log('Barcode detected:', result.getText())
              onBarcode(result.getText())
            }
          }
        )
      } catch (err) {
        console.error('Failed to initialize camera or barcode reader:', err)
      }
    }

    setupCamera()

    // Clean up when changing camera or component unmounts
    return releaseCamera
  }, [selectedCamera, onBarcode])

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
              // Find the next camera in the list (cycling back to beginning if necessary)
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
            style={{ width: '100%', marginTop: '1rem' }}
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

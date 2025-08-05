import { useCallback, useEffect, useState } from 'react'

const useCameras = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [maxFrameRate, setMaxFrameRate] = useState(30)
  const [maxHeight, setMaxHeight] = useState(720)
  const [maxWidth, setMaxWidth] = useState(1280)

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

  const setTorch = useCallback(
    async (state: boolean) => {
      if (!hasTorch || !selectedCamera) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera },
        })
        const track = stream.getVideoTracks()[0]

        await track.applyConstraints({
          advanced: [{ torch: state }] as unknown as MediaTrackConstraints[],
        })
        setIsTorchOn(state)
      } catch (e) {
        console.error('Torch toggle error:', e)
      }
    },
    [selectedCamera, hasTorch]
  )

  useEffect(() => {
    const checkTorchSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera!,
          },
        })
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        const { frameRate, height, width } = capabilities
        setMaxFrameRate(frameRate?.max || 30)
        setMaxHeight(height?.max || 720)
        setMaxWidth(width?.max || 1280)
        setHasTorch('torch' in capabilities)
      } catch (e) {
        console.error('Error checking torch support:', e)
      }
    }

    if (selectedCamera) {
      checkTorchSupport()
    }
  }, [selectedCamera])

  useEffect(() => {
    setTorch(false)
  }, [selectedCamera, setTorch])

  return {
    devices,
    selected: selectedCamera,
    setSelected: setSelectedCamera,
    hasTorch,
    isTorchOn,
    setTorch,
    constraints: {
      width: { ideal: maxWidth },
      height: { ideal: maxHeight },
      frameRate: { ideal: maxFrameRate },
    },
  }
}

export default useCameras

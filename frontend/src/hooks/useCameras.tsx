import { useCallback, useEffect, useRef, useState } from 'react'

const useCameras = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [maxFrameRate, setMaxFrameRate] = useState(30)
  const [maxHeight, setMaxHeight] = useState(720)
  const [maxWidth, setMaxWidth] = useState(1280)

  const activeTrackRef = useRef<MediaStreamTrack | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        stream.getTracks().forEach((track) => track.stop())

        if (!mounted) return

        const devices = await navigator.mediaDevices.enumerateDevices()

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        )

        if (videoDevices.length > 0) {
          const preferredCamera = videoDevices.find((device) =>
            /back|rear|environment|HD/i.test(device.label)
          )
          setSelectedCamera(
            preferredCamera?.deviceId || videoDevices[0].deviceId
          )
          setDevices(videoDevices)
        }
      } catch (error) {
        console.error('Error fetching cameras:', error)
      }
    }

    fetchDevices()

    return () => {
      mounted = false
    }
  }, [])

  const setTorch = useCallback(
    async (state: boolean) => {
      if (!hasTorch || !selectedCamera) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera },
        })
        const track = stream.getVideoTracks()[0]
        activeTrackRef.current = track

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
    let mounted = true
    const getCapabilities = async () => {
      if (!selectedCamera) return

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera },
        })
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        const track = stream.getVideoTracks()[0]
        activeTrackRef.current = track

        const capabilities = track.getCapabilities()
        setMaxFrameRate(capabilities.frameRate?.max || 30)
        setMaxHeight(capabilities.height?.max || 720)
        setMaxWidth(capabilities.width?.max || 1280)
        setHasTorch('torch' in capabilities)

        stream.getTracks().forEach((t) => t.stop())
        activeTrackRef.current = null
      } catch (error) {
        console.error('Error getting camera capabilities:', error)
        setHasTorch(false)
      }
    }

    getCapabilities()

    return () => {
      mounted = false
      if (activeTrackRef.current) {
        activeTrackRef.current.stop()
        activeTrackRef.current = null
      }
    }
  }, [selectedCamera])

  useEffect(() => {
    setIsTorchOn(false)
  }, [selectedCamera])

  useEffect(() => {
    return () => {
      if (activeTrackRef.current) {
        activeTrackRef.current.stop()
        activeTrackRef.current = null
        setIsTorchOn(false)
      }
    }
  }, [])

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

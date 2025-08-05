import { useEffect, useState } from 'react'

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

export default useCameras

import { useCallback, useEffect, useState } from 'react'

const useTorch = (deviceId: string) => {
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)

  const setTorch = useCallback(
    async (state: boolean) => {
      if (!hasTorch) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
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
    [deviceId, hasTorch]
  )

  useEffect(() => {
    const checkTorchSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId,
          },
        })
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        setHasTorch('torch' in capabilities)
      } catch (e) {
        console.error('Error checking torch support:', e)
      }
    }

    if (deviceId) {
      checkTorchSupport()
    }
  }, [deviceId])

  return {
    hasTorch,
    isTorchOn,
    setTorch,
  }
}

export default useTorch

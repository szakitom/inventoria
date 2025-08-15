import { useCallback, useRef } from 'react'
import { Flashlight, FlashlightOff } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { Spinner } from '@/components/ui/spinner'
import useCameras from '@/hooks/useCameras'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'

const BarcodeScanner = ({
  open = true,
  onBarcode,
}: {
  onBarcode: (code: string) => void
  open?: boolean
}) => {
  const {
    devices,
    selected,
    setSelected,
    hasTorch,
    isTorchOn,
    setTorch,
    // constraints,
  } = useCameras()

  const scannerRef = useRef<HTMLDivElement>(null)

  const onDetected = (result: string) => {
    onBarcode(result)
    if (hasTorch && isTorchOn) {
      setTorch(false)
    }
  }

  useBarcodeScanner({
    open,
    container: scannerRef.current,
    onDetected: onDetected,
    cameraId: selected ?? undefined,
    // constraints,
  })

  const toggleTorch = useCallback(() => {
    if (!hasTorch) return
    setTorch(!isTorchOn)
  }, [hasTorch, isTorchOn, setTorch])

  if (devices.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 w-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-black/70 backdrop-blur-md flex justify-center space-x-2 text-white font-semibold select-none">
        <Select
          value={selected || ''}
          onValueChange={(value) => setSelected(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Camera" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasTorch && (
          <Toggle
            variant="outline"
            aria-label="Toggle flashlight"
            pressed={isTorchOn}
            onPressedChange={toggleTorch}
          >
            {isTorchOn ? <FlashlightOff /> : <Flashlight />}
          </Toggle>
        )}
      </div>

      <div ref={scannerRef} className="absolute inset-0 w-full h-full">
        <video className="w-full h-full object-cover" />
        <canvas className="drawingBuffer absolute top-0 left-0 w-full h-full" />
      </div>
    </div>
  )
}

export default BarcodeScanner

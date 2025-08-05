import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import useCameras from '@/hooks/useCameras'
import BarcodeScanner from '@components/BarcodeScanner'
import useTorch from '@/hooks/useTorch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Toggle } from '@components/ui/toggle'
import { Flashlight, FlashlightOff } from 'lucide-react'
import { Spinner } from '@components/ui/spinner'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

const Scanner = () => {
  const { devices, selected, setSelected } = useCameras()
  const { hasTorch, isTorchOn, setTorch } = useTorch(selected || '')
  const [results, setResults] = useState<string[]>([])

  const scannerRef = useRef<HTMLDivElement>(null)

  const onDetected = useCallback(
    (result: string) => {
      setResults((prev) => [...prev, result])
      setTorch(false)
    },
    [setTorch]
  )

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
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex w-full items-center justify-center space-x-2">
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
            {!isTorchOn ? <Flashlight /> : <FlashlightOff />}
          </Toggle>
        )}
      </div>

      <div
        ref={scannerRef}
        className="w-full flex justify-center items-center overflow-hidden h-[70vh]"
      >
        <video
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas className="drawingBuffer absolute top-0 left-0 w-full h-full" />
        {selected ? (
          <BarcodeScanner
            scannerRef={scannerRef}
            cameraId={selected}
            onDetected={onDetected}
          />
        ) : null}
      </div>
    </div>
  )
}

function RouteComponent() {
  const [open, setOpen] = useState(true)

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

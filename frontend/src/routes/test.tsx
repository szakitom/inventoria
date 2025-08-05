import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import useCameras from '@/hooks/useCameras'
import BarcodeScanner from '@components/BarcodeScanner'
import useTorch from '@/hooks/useTorch'

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
    return <div>Loading...</div>
  }

  return (
    <div>
      {hasTorch && (
        <button onClick={toggleTorch}>
          {isTorchOn ? 'Disable Torch' : 'Enable Torch'}
        </button>
      )}

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

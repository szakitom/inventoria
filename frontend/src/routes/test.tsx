import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import BarcodeScanner from '@components/BarcodeScanner'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  const [open, setOpen] = useState(true)

  const handleBarcode = useCallback((code: string) => {
    console.log('Barcode detected:', code)
    setOpen(false)
  }, [])

  return (
    <div>
      <div>
        <button onClick={() => setOpen(!open)}>
          {open ? 'Close Scanner' : 'Open Scanner'}
        </button>
      </div>
      {open && <BarcodeScanner onBarcode={handleBarcode} />}
    </div>
  )
}

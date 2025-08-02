import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import BarcodeScanner from './BarcodeScanner'

// Define styles object for reuse
const styles = {
  container: {
    padding: '20px',
    margin: '0 auto',
    maxWidth: '500px',
    width: '100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },

  scanButton: {
    padding: '10px',
    backgroundColor: '#4a76dd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  dialogContent: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    height: '100vh',
    zIndex: 1000,
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
  },
  dialogTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  cancelButton: {
    padding: '8px 15px',
    backgroundColor: '#f1f1f1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

const Simple = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [barcode, setBarcode] = useState('')

  const handleCode = (code: string) => {
    setBarcode(code)
    setIsOpen(false)
    // You can add additional logic here, like sending the code to a server
  }

  return (
    <div style={styles.container}>
      {barcode && <div>{barcode}</div>}
      <button
        type="button"
        style={styles.scanButton}
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(true)
        }}
      >
        Scan
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div style={styles.dialogContent}>
          <DialogPanel>
            <div style={styles.dialogHeader}>
              <DialogTitle as="h3" style={styles.dialogTitle}>
                Scan Barcode
              </DialogTitle>
              <button
                style={styles.cancelButton}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
            <BarcodeScanner onBarcode={handleCode} />
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default Simple

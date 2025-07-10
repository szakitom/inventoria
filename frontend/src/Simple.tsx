import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'
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
  formGroup: {
    marginBottom: '15px',
    width: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#4a76dd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
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
  inputGroup: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },
  dateInput: {
    width: 'calc(33.33% - 7px)',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  },
  barcodeContainer: {
    display: 'flex',
    width: '100%',
  },
  barcodeInput: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px 0 0 8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
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
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expirationMonth, setExpirationMonth] = useState('')
  const [expirationDay, setExpirationDay] = useState('')
  const [expirationYear, setExpirationYear] = useState('2025')
  // Define types for location and shelf data
  interface Shelf {
    id: string
    name: string
  }

  interface Location {
    id: string
    name: string
    shelves: Shelf[]
  }

  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedShelf, setSelectedShelf] = useState('')

  // Create refs for expiration date fields
  const expirationDayRef = useRef<HTMLInputElement>(null)
  const expirationYearRef = useRef<HTMLInputElement>(null)
  const expirationMonthRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const getLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const handleCode = (code: string) => {
    setBarcode(code)
    setIsOpen(false)
    // You can add additional logic here, like sending the code to a server
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const expiration = {
      year: expirationYear,
      month: expirationMonth,
      day: expirationDay,
    }
    const itemData = {
      barcode,
      name,
      amount,
      quantity,
      expiration,
      location: selectedShelf,
    }
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error creating item:', errorData)
      alert(`Error creating item: ${errorData.error || 'Unknown error'}`)
      return
    }
    const createdItem = await response.json()
    console.log('Item created successfully:', createdItem)
    alert('Item created successfully!')
    // Reset form fields after submission
    setBarcode('')
    setName('')
    setAmount('')
    setQuantity('')
    setExpirationMonth('')
    setExpirationDay('')
    if (nameRef.current) {
      nameRef.current?.focus()
    }
  }

  useEffect(() => {
    getLocations()
  }, [])

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Barcode</label>
          <div style={styles.barcodeContainer}>
            <input
              style={styles.barcodeInput}
              value={barcode}
              type="number"
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode"
            />
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
          </div>
        </div>

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
        <div style={styles.formGroup}>
          <label style={styles.label}>Quantity</label>
          <input
            style={styles.input}
            value={quantity}
            placeholder="Enter quantity"
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Name*</label>
          <input
            style={styles.input}
            required
            placeholder="Product name"
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Amount*</label>
          <input
            style={styles.input}
            value={amount}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter amount"
            required
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Expiration Date</label>
          <div style={styles.inputGroup}>
            <input
              ref={expirationYearRef}
              style={styles.dateInput}
              type="number"
              placeholder="YYYY"
              value={expirationYear}
              onChange={(e) => {
                const value = e.target.value
                setExpirationYear(e.target.value)
                if (value.length === 4 && expirationMonthRef.current) {
                  expirationMonthRef.current.focus()
                }
              }}
            />
            <input
              style={styles.dateInput}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={12}
              value={expirationMonth}
              ref={expirationMonthRef}
              placeholder="MM"
              onChange={(e) => {
                const value = e.target.value
                setExpirationMonth(value)
                // Auto-advance to the day field when 2 digits are entered
                if (value.length === 2 && expirationDayRef.current) {
                  expirationDayRef.current.focus()
                }
              }}
              maxLength={2}
            />
            <input
              ref={expirationDayRef}
              style={styles.dateInput}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={expirationDay}
              placeholder="DD"
              min={1}
              max={31}
              onChange={(e) => {
                const value = e.target.value
                setExpirationDay(value)
              }}
              maxLength={2}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Location*</label>
          <select
            style={styles.select}
            required
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {selectedLocation && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Shelf*</label>
            <select
              style={styles.select}
              required
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
            >
              <option value="">Select Shelf</option>
              {locations
                .find((loc) => loc.id === selectedLocation)
                ?.shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: selectedShelf && name && amount ? 1 : 0.5,
          }}
          disabled={!selectedShelf || !name || !amount}
        >
          Add Item
        </button>
      </form>
    </div>
  )
}

export default Simple

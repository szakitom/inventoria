import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'
import BarcodeScanner from './BarcodeScanner'

const Simple = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expirationMonth, setExpirationMonth] = useState('')
  const [expirationDay, setExpirationDay] = useState('')
  const [expirationYear, setExpirationYear] = useState('2025')
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedShelf, setSelectedShelf] = useState('')

  // Create refs for expiration date fields
  const expirationDayRef = useRef<HTMLInputElement>(null)
  const expirationYearRef = useRef<HTMLInputElement>(null)

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
  }

  useEffect(() => {
    getLocations()
  }, [])

  return (
    <>
      <form
        style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}
      >
        <label>Barcode</label>
        <span>
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <button onClick={() => setIsOpen(true)}>Get barcode</button>
        </span>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              height: '100vh',
            }}
          >
            <DialogPanel>
              <DialogTitle>Barcode</DialogTitle>
              <div>
                <button onClick={() => setIsOpen(false)}>Cancel</button>
              </div>
              <BarcodeScanner onBarcode={handleCode} />
            </DialogPanel>
          </div>
        </Dialog>
        <label>Name*</label>
        <input
          required
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Amount*</label>
        <input
          value={amount}
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          required
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <label>Quantity</label>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <label>Expiration Date</label>
        <input
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          min={1}
          max={12}
          value={expirationMonth}
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
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          value={expirationDay}
          placeholder="DD"
          min={1}
          max={31}
          onChange={(e) => {
            const value = e.target.value
            setExpirationDay(value)
            // Auto-advance to the year field when 2 digits are entered
            if (value.length === 2 && expirationYearRef.current) {
              expirationYearRef.current.focus()
            }
          }}
          maxLength={2}
        />
        <input
          ref={expirationYearRef}
          type="number"
          value={expirationYear}
          onChange={(e) => setExpirationYear(e.target.value)}
        />
        <label>Location*</label>
        <select
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
        {selectedLocation && (
          <>
            <label>Shelf</label>
            <select
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
          </>
        )}
        {selectedShelf && name && amount && (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </form>
    </>
  )
}

export default Simple

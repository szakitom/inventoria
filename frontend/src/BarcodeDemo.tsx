import { useState, useEffect } from 'react'
import BarcodeScanner from './BarcodeScanner'

function App() {
  const [barcode, setBarcode] = useState<string | null>(null)
  const [isScannerActive, setIsScannerActive] = useState<boolean>(true)

  // Handle barcode detection
  const handleBarcode = (value: string) => {
    setBarcode(value)
    // setIsScannerActive(false)
    console.log(`Barcode detected: ${value}`)
  }

  // // Reset scanner for next use
  // const resetScanner = () => {
  //   setBarcode(null)
  //   // Small delay before activating the scanner again to ensure proper cleanup
  //   setTimeout(() => {
  //     setIsScannerActive(true)
  //   }, 100)
  // }

  // // Clean up effect when component unmounts
  // useEffect(() => {
  //   return () => {
  //     // Final cleanup when App component unmounts
  //     console.log('App component unmounting, ensuring camera is released')
  //   }
  // }, [])

  return (
    <div className="app-container">
      {!barcode ? (
        <BarcodeScanner onBarcode={handleBarcode} />
      ) : (
        <div className="results-container">
          <h2>Scan Result</h2>
          <p>{barcode}</p>
          {/* <button onClick={resetScanner}>Scan Another</button> */}
        </div>
      )}
    </div>
  )
}

export default App

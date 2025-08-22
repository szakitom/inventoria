import { X } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer'
import BarcodeScanner from '@/components/BarcodeScanner'

type BarcodeDrawerProps = {
  open: boolean
  handleOpenChange: (open: boolean) => void
  onBarcode: (barcode: string) => void
}

const BarcodeDrawer = ({
  open,
  handleOpenChange,
  onBarcode,
}: BarcodeDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTitle className="sr-only">Scan Barcode</DrawerTitle>
      <DrawerContent className="h-full md:h-4/5 w-full md:w-1/2 flex flex-col mx-auto overflow-hidden">
        <DrawerClose className="absolute top-0 right-0 p-2 z-10">
          <X />
        </DrawerClose>

        <div className="flex-grow flex flex-col items-center justify-center overflow-hidden pt-4">
          <BarcodeScanner onBarcode={onBarcode} open={open} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default BarcodeDrawer

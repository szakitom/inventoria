import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import Barcode from 'react-barcode'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  ChevronDownIcon,
  MapPin,
  MoreVertical,
  Move,
  Refrigerator,
  Rows3,
  Snowflake,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@components/ui/label'
import { motion, AnimatePresence } from 'motion/react'
import AmountInput from './ui/amountinput'
import { LocationType, type IItem } from './Items'
import { Separator } from './ui/separator'
import SaveButton from './Savebutton'
import MoveDialog from './MoveDialog'
import DeleteDialog from './DeleteDialog'
import { deleteItem, updateItem } from '@utils/api'
import { useRouter } from '@tanstack/react-router'

const getLocationIcon = (type: string) => {
  if (type === LocationType.Freezer) {
    return Snowflake
  }
  if (type === LocationType.Refrigerator) {
    return Refrigerator
  }
  if (type === LocationType.Pantry) {
    return Rows3
  }
  return MapPin
}

const getExpirationStatus = (expiresIn: number | undefined) => {
  if (!expiresIn)
    return {
      color: 'text-gray-500',
      border: 'border-muted',
    }
  if (expiresIn < 0) return { color: 'text-red-500', border: 'border-red-300' }
  if (expiresIn <= 30)
    return { color: 'text-yellow-500', border: 'border-yellow-300' }
  if (expiresIn <= 60)
    return { color: 'text-orange-500', border: 'border-orange-300' }

  return { color: 'text-green-500', border: 'border-muted' }
}

const Item = ({ item }: { item: IItem }) => {
  const [isExpanded, setExpanded] = useState(false)
  const LocationIcon = getLocationIcon(item.location.location.type)
  const [amount, setAmount] = useState(Number(item.amount) || 0)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setMoveDialogOpen] = useState(false)
  const router = useRouter()

  const status = getExpirationStatus(item.expiresIn)

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount)
  }

  const dataChanged = item.amount !== amount

  const handleSaveChanges = async () => {
    try {
      await updateItem(item.id, { amount })
      router.invalidate()
      toast.success('Changes saved successfully!')
    } catch (error) {
      toast.error('Failed to save changes')
      console.error('Error saving item:', error)
    }
  }

  const handleMoveItem = async () => {
    console.log('Move item', item.id)
    alert('Move item functionality not implemented yet')
  }

  const handleDeleteItem = async () => {
    try {
      await deleteItem(item.id)
      router.invalidate()
      toast.success('Item deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete item')
      console.log('Error deleting item:', error)
    }
  }

  return (
    <Card
      className={cn(
        'p-3 flex flex-col gap-2 overflow-hidden transition-border',
        status.border,
        dataChanged ? ' border-sky-500' : ''
      )}
    >
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onChange={setDeleteDialogOpen}
        onSubmit={handleDeleteItem}
      />
      <MoveDialog
        isOpen={isMoveDialogOpen}
        onChange={setMoveDialogOpen}
        onSubmit={handleMoveItem}
      />
      <CardHeader className="p-0 pb-0 gap-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold leading-tight truncate">
              {item.name}
            </CardTitle>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1 truncate">
              <LocationIcon className="h-4 w-4 text-blue-500" />
              <span className="truncate">
                {item.location.location.name}
                <Badge variant="outline" className="ml-2">
                  {item.location.name.replace('Shelf', '')}
                </Badge>
              </span>
            </div>
          </div>

          {dataChanged ? (
            <SaveButton onClick={handleSaveChanges} />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-28">
                <DropdownMenuItem
                  onClick={() => setMoveDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Move />
                  <span>Move</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <Separator className="" />
      <CardContent className="p-0 text-sm">
        <div className="space-y-2">
          <AmountInput value={amount} onChange={handleAmountChange} />
          <div className="flex items-center gap-2">
            <span>
              <Label className="">Amount:</Label>
            </span>
            <Badge className="bg-muted-foreground text-white font-bold text-sm font-mono">
              {amount}
            </Badge>
            {item.quantity && (
              <>
                <X className="text-foreground w-4 h-4" />
                <Badge className="bg-muted text-foreground text-sm">
                  {item.quantity || 'pcs'}
                </Badge>
              </>
            )}
          </div>
          <div
            className={cn(
              'flex items-center gap-2',
              item.expiresIn ? 'visible' : 'invisible'
            )}
          >
            <span>
              <Label>Expires In:</Label>
            </span>
            <span
              className={cn(
                'text-gray-600 text-sm font-semibold',
                status.color
              )}
            >
              <span className="font-mono">{item.expiresIn}</span>
              <span className="ml-1">days</span>
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted -mx-3 -mb-3 p-0">
        <Collapsible
          className="w-full"
          open={isExpanded}
          onOpenChange={() => setExpanded(!isExpanded)}
        >
          <CollapsibleTrigger className="w-full px-3 py-2 flex justify-between items-center cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Details</span>
            </span>
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </CollapsibleTrigger>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="content"
                initial={{ maxHeight: 0, opacity: 0 }}
                animate={{ maxHeight: 300, opacity: 1 }}
                exit={{ maxHeight: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden px-3 py-2 text-foreground"
              >
                <div className="flex flex-col gap-2">
                  {item.expiration && (
                    <div className="w-full flex items-center justify-between mb-2">
                      <Label>Expiration:</Label>
                      <span className="text-sm">
                        {new Date(item.expiration).toLocaleDateString('hu-HU')}
                      </span>
                    </div>
                  )}
                  {item.createdAt && (
                    <div className="w-full flex items-center justify-between mb-2">
                      <Label>Added At:</Label>
                      <span className="text-sm">
                        {new Date(item.createdAt).toLocaleDateString('hu-HU')}
                      </span>
                    </div>
                  )}
                  {item.barcode && (
                    <div className="flex w-full flex-col">
                      <div className="w-full flex items-center justify-between mb-2">
                        <Label>Barcode:</Label>
                        <span className="text-sm font-mono">
                          {item.barcode}
                        </span>
                      </div>
                      <div className="w-full rounded-sm bg-white text-white font-mono flex items-center justify-center p-0">
                        <Barcode value={item.barcode} background="white" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Collapsible>
      </CardFooter>
    </Card>
  )
}
export default Item

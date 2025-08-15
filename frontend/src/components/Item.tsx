import { memo, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from '@tanstack/react-router'
import {
  ChevronDownIcon,
  MoreVertical,
  Move,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import AmountInput from '@/components/ui/amountinput'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'
import { getExpirationStatus, getLocationIcon, type IItem } from '@/utils/index'
import { deleteItem, moveItem, movePartialItem, updateItem } from '@/utils/api'
import { useGlobalDialog } from '@/hooks/useGlobalDialog'
import SaveButton from '@/components/Savebutton'
import ImageBarcodeTab from '@/components/ImageBarcodeTab'
import ImagePreview from '@/components/ImagePreview'

const Item = ({ item, from }: { item: IItem; from?: string }) => {
  const [isExpanded, setExpanded] = useState(false)
  const LocationIcon = getLocationIcon(item.location.location.type)
  const [amount, setAmount] = useState(Number(item.amount) || 0)
  const router = useRouter()
  const { open } = useGlobalDialog()

  useEffect(() => {
    setAmount(Number(item.amount) || 0)
  }, [item.amount])

  const status = getExpirationStatus(item.expiresIn)

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount)
  }

  const dataChanged = item.amount !== amount

  const handleSaveChanges = async () => {
    try {
      await updateItem(item.id, { amount })
      toast.success('Changes saved successfully!')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to save changes')
      console.error('Error saving item:', error)
    }
  }

  const handleMoveItem = async (location: string, amount?: number) => {
    try {
      if (amount) {
        await movePartialItem(item.id, location, amount)
      } else {
        await moveItem(item.id, location)
      }
      toast.success('Item moved successfully!')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to move item')
      console.error('Error moving item:', error)
    }
  }

  const handleDeleteItem = async () => {
    try {
      await deleteItem(item.id)
      toast.success('Item deleted successfully!')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to delete item')
      console.error('Error deleting item:', error)
    }
  }

  const handleEditItem = async (editedItem: Partial<IItem>) => {
    try {
      await updateItem(item.id, editedItem)
      toast.success('Item edited successfully!')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to edit item')
      console.error('Error editing item:', error)
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
      <CardHeader className="p-0 pb-0 gap-0">
        <div className="flex items-start justify-between">
          <div className={cn('flex gap-2 min-h-16 items-start')}>
            <ImagePreview
              image={item.image}
              name={item.name}
              openFoodFacts={item.openFoodFacts}
              blurhash={item.blurhash}
            />

            <div className="min-w-0 flex-1 overflow-hidden">
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                {item.name}
              </CardTitle>
              <div className="flex items-center space-x-1 text-sm mt-1 truncate">
                <LocationIcon className="h-4 w-4 text-blue-500" />
                <span className="truncate">
                  {item.location.location.name}
                  <Badge variant="outline" className="ml-2">
                    {item.location.name.split(' ')[1]}
                  </Badge>
                </span>
              </div>
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
                  onClick={() =>
                    open('move', {
                      onSubmit: async (location: string, amount: number) => {
                        await handleMoveItem(location, amount)
                      },
                      data: { ...item, from },
                    })
                  }
                  className="cursor-pointer"
                >
                  <Move />
                  <span>Move</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    open('edit', {
                      data: item,
                      onSubmit: async (item: Partial<IItem>) => {
                        await handleEditItem(item)
                      },
                    })
                  }
                  className="cursor-pointer"
                >
                  <Pencil />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() =>
                    open('delete', {
                      data: { id: item.id, name: item.name },
                      onSubmit: async () => {
                        await handleDeleteItem()
                      },
                    })
                  }
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
            <Badge className="font-bold text-sm font-mono">{item.amount}</Badge>
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
              item.expiration ? 'visible' : 'invisible'
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
      <CardFooter
        className={cn(
          '-mx-3 -mb-3 p-0',
          (item.openFoodFacts || item.barcode) && 'bg-muted'
        )}
      >
        <Collapsible
          className="w-full"
          open={isExpanded}
          onOpenChange={() => setExpanded(!isExpanded)}
        >
          <CollapsibleTrigger className="w-full px-3 py-2 flex justify-between items-center cursor-pointer">
            <span className="flex items-center gap-2">
              <div
                className={cn(
                  'text-sm',
                  item.openFoodFacts
                    ? 'font-bold text-foreground'
                    : 'font-normal'
                )}
              >
                Details
              </div>
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
                initial={
                  !item.openFoodFacts
                    ? { maxHeight: 0, opacity: 0 }
                    : { height: 0, opacity: 0 }
                }
                animate={
                  !item.openFoodFacts
                    ? { maxHeight: 400, opacity: 1 }
                    : { height: 'auto', opacity: 1 }
                }
                exit={
                  !item.openFoodFacts
                    ? { maxHeight: 0, opacity: 0 }
                    : { height: 0, opacity: 0 }
                }
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
                  <ImageBarcodeTab
                    off={item.openFoodFacts}
                    barcode={item.barcode}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Collapsible>
      </CardFooter>
    </Card>
  )
}
export default memo(Item)

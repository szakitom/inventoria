import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Input } from '@components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ScrollArea } from './ui/scroll-area'
import AmountInput from './ui/amountinput'
import { useHookFormMask } from 'use-mask-input'
import type { IItem } from './Items'
import { Spinner } from './ui/spinner'
import { Item } from '@utils/item'
import { ScanBarcode } from 'lucide-react'

interface EditDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (payload: Partial<IItem>) => Promise<void>
  data?: {
    location?: {
      location?: {
        id: string
        type?: string
        name?: string
      }
    }
    [key: string]: unknown
  }
}

const EditDialog = ({
  isOpen,
  onCancel,
  onSubmit: submitDialog,
  data: item,
}: EditDialogProps) => {
  type FormValues = z.infer<typeof Item.itemFormSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(Item.itemFormSchema),
    defaultValues: {
      name: item?.name as string | undefined,
      barcode: item?.barcode as string | undefined,
      expiration: item?.expiration
        ? new Date(item.expiration as string | number | Date)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '/')
        : '',
      amount: item?.amount ? Number(item.amount) : 0,
      quantity: item?.quantity as string | undefined,
    },
  })

  const registerWithMask = useHookFormMask(form.register)

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      expiration: values.expiration
        ? new Date(values.expiration).toISOString()
        : null,
    }

    await submitDialog(payload)
  }

  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="flex max-h-[min(600px,80vh)] md:max-h-[90vh] flex-col gap-0 p-0 sm:max-w-md">
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-6">
              <div className="text-lg font-semibold ">Edit Item</div>
              <DialogDescription className="text-sm text-muted-foreground">
                Editing details for {(item?.name as string) || 'this item'}.
              </DialogDescription>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name"
                            className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <div className="w-full space-y-2">
                            <div className="flex rounded-md shadow-xs">
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Barcode"
                                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10 focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
                                {...field}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="rounded-s-none rounded-e-md text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground transition-[color]"
                                aria-label="Scan Barcode"
                                // TODO: Implement barcode scanning
                                onClick={() => alert('not implemented yet')}
                              >
                                <ScanBarcode size={16} aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiration"
                    render={() => (
                      <FormItem>
                        <FormLabel>Expiration</FormLabel>
                        <FormControl>
                          <Input
                            {...registerWithMask('expiration', '9999/99/99', {
                              tabThrough: true,
                            })}
                            placeholder="YYYY/MM/DD"
                            className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <AmountInput
                            value={Number(field.value) || 0}
                            onChange={(value) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Quantity"
                            className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="cursor-pointer bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 hover:bg-blue-600 min-w-20 text-white"
                    type="submit"
                    disabled={
                      !form.formState.isValid ||
                      form.formState.isSubmitting ||
                      !form.formState.isDirty
                    }
                  >
                    {form.formState.isSubmitting ? <Spinner /> : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog

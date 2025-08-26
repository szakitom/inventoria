import { useEffect, useState } from 'react'
import { ScanBarcode } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useHookFormMask } from 'use-mask-input'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import AmountInput from '@/components/ui/amountinput'
import { Spinner } from '@/components/ui/spinner'
import { Item } from '@/utils/item'
import BarcodeDrawer from '@/components/BarcodeDrawer'
import ImageUpload from '@/components/ImageUpload'
import { getPresignUrlForId } from '@utils/api'
import type { IItem } from '@/utils/index'

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
    id: string
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
      image: item?.image as string | undefined,
      blurhash: item?.blurhash as string | undefined,
    },
  })

  const [presignURL, setPresignURL] = useState()

  const registerWithMask = useHookFormMask(form.register)
  const [bardcodeScanOpen, setBarcodeScanOpen] = useState(false)

  const handleBarcodeSubmit = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldDirty: true })
    setBarcodeScanOpen(false)
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      expiration: values.expiration
        ? new Date(values.expiration).toISOString()
        : null,
    }

    await submitDialog(payload)
  }

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
        await submitDialog({
          image: form.getValues('image'),
          blurhash: form.getValues('blurhash'),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [form, form.formState.isDirty, submitDialog])

  useEffect(() => {
    const fetchPresignURL = async () => {
      const controller = new AbortController()
      const { signal } = controller

      try {
        const newPresign = await getPresignUrlForId({ signal, id: item!.id })
        setPresignURL(newPresign.url)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        console.error('Failed to refresh presign URL', err)
      }

      return () => controller.abort()
    }
    fetchPresignURL()
  }, [item])

  const handleHashChange = async (blurhash: string) => {
    form.setValue('blurhash', blurhash, { shouldDirty: true })
  }

  if (!isOpen) return null
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !form.formState.isDirty && onCancel()}
    >
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
                  <div className="flex items-start space-x-4 w-full">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Product Name"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="relative inline-flex">
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="sr-only">Image</FormLabel>
                            <FormControl>
                              <ImageUpload
                                presignURL={presignURL || ''}
                                field={field}
                                imageURL={item?.image as string | undefined}
                                editing
                                onHashChange={handleHashChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
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
                                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                                {...field}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="rounded-s-none rounded-e-md text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground transition-[color]"
                                aria-label="Scan Barcode"
                                onClick={() => setBarcodeScanOpen(true)}
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
                            inputMode="numeric"
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
                          <Input placeholder="Quantity" {...field} />
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
                    type="reset"
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
      <BarcodeDrawer
        open={bardcodeScanOpen}
        onBarcode={handleBarcodeSubmit}
        handleOpenChange={setBarcodeScanOpen}
      />
    </Dialog>
  )
}

export default EditDialog

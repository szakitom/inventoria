import { useState } from 'react'
import { toast } from 'sonner'
import { ScanBarcode } from 'lucide-react'
import { createFileRoute, defer } from '@tanstack/react-router'
import { useHookFormMask } from 'use-mask-input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import AmountInput from '@/components/ui/amountinput'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createItem, fetchLocations, getPresignUrl } from '@/utils/api'
import { Item } from '@/utils/item'
import LocationSelect from '@/components/LocationSelect'
import BarcodeDrawer from '@/components/BarcodeDrawer'
import ImageUpload from '@/components/ImageUpload'
import { DialogProvider } from '@/hooks/DialogProvider'

export const Route = createFileRoute('/add/')({
  component: Add,
  loader: async ({ abortController }) => {
    return {
      locations: defer(fetchLocations({ signal: abortController.signal })),
      presign: await getPresignUrl({ signal: abortController.signal }),
    }
  },
})

function Add() {
  type FormValues = z.infer<typeof Item.itemFormSchema>

  const data = Route.useLoaderData()
  const form = useForm<FormValues>({
    resolver: zodResolver(Item.itemFormSchema),
    defaultValues: {
      name: '' as string | undefined,
      barcode: '' as string | undefined,
      expiration: '' as string | undefined,
      amount: 1 as number | undefined,
      quantity: '' as string | undefined,
      shelf: '' as string | undefined,
      image: '' as string | undefined,
      uuid: '' as string | undefined,
      blurhash: '' as string | undefined,
    },
  })

  const registerWithMask = useHookFormMask(form.register)
  const [bardcodeScanOpen, setBarcodeScanOpen] = useState(false)
  const [presignURL, setPresignURL] = useState(data.presign.url)
  const [presignUUID, setPresignUUID] = useState(data.presign.uuid)

  const refreshPresignURL = async () => {
    const controller = new AbortController()
    const { signal } = controller

    try {
      const newPresign = await getPresignUrl({ signal })
      setPresignURL(newPresign.url)
      setPresignUUID(newPresign.uuid)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      console.error('Failed to refresh presign URL', err)
    }

    return () => controller.abort()
  }

  const handleHashChange = (blurhash: string) => {
    form.setValue('blurhash', blurhash, { shouldDirty: true })
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const currentShelf = form.getValues('shelf')!
      const payload = {
        ...values,
        expiration: values.expiration
          ? new Date(values.expiration).toISOString()
          : null,
        location: currentShelf,
        uuid: presignUUID,
      }

      await createItem(payload)
      toast.success('Item created successfully!')

      form.reset({
        name: '',
        barcode: '',
        expiration: '',
        amount: 1,
        quantity: '',
        shelf: currentShelf,
        image: '',
      })
      await refreshPresignURL()
    } catch (error) {
      toast.error('Failed to create item.')
      console.error('Error creating item:', error)
    }
  }

  const handleBarcodeSubmit = (barcode: string) => {
    form.setValue('barcode', barcode, { shouldDirty: true })
    setBarcodeScanOpen(false)
  }

  return (
    <DialogProvider>
      <main className="p-4 max-w-lg mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            presignURL={presignURL}
                            field={field}
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
                        value={field.value}
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
                      <Input placeholder="kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shelf"
                render={({ field }) => (
                  <FormItem>
                    <LocationSelect
                      locations={data.locations}
                      label={<FormLabel>Location</FormLabel>}
                      shelfLabel={<FormLabel>Shelf</FormLabel>}
                      onSelect={(value: string) => field.onChange(value)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              className="cursor-pointer bg-blue-500 dark:bg-blue-800 dark:hover:bg-blue-900 hover:bg-blue-600 min-w-20 w-full text-white rounded-md"
              type="submit"
              disabled={
                !form.formState.isValid ||
                form.formState.isSubmitting ||
                !form.formState.isDirty ||
                !form.getValues('shelf')
              }
            >
              {form.formState.isSubmitting ? <Spinner /> : 'Save'}
            </Button>
          </form>
        </Form>
        <BarcodeDrawer
          open={bardcodeScanOpen}
          onBarcode={handleBarcodeSubmit}
          handleOpenChange={setBarcodeScanOpen}
        />
      </main>
    </DialogProvider>
  )
}

import { createFileRoute, defer } from '@tanstack/react-router'
import { createItem, fetchLocations } from '@utils/api'
import LocationSelect from '@components/LocationSelect'
import { useHookFormMask } from 'use-mask-input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import AmountInput from '@components/ui/amountinput'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import { Item } from '@utils/item'
import { toast } from 'sonner'
import { Construction, ScanBarcode, X } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer'
import { useState } from 'react'

export const Route = createFileRoute('/add/')({
  component: Add,
  loader: async ({ abortController }) => {
    return {
      locations: defer(fetchLocations({ signal: abortController.signal })),
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
    },
  })

  const registerWithMask = useHookFormMask(form.register)
  const [bardcodeScanOpen, setBarcodeScanOpen] = useState(false)

  const onSubmit = async (values: FormValues) => {
    try {
      const currentShelf = form.getValues('shelf')!
      const payload = {
        ...values,
        expiration: values.expiration
          ? new Date(values.expiration).toISOString()
          : null,
        location: currentShelf,
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
      })
    } catch (error) {
      toast.error('Failed to create item.')
      console.error('Error creating item:', error)
    }
  }

  const handleBarcodeSubmit = (barcode: string) => {
    console.log('Barcode submitted:', barcode)
    // form.setValue('barcode', '1234567890')
    setBarcodeScanOpen(false)
  }

  return (
    <main className="p-4 max-w-lg mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
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
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 min-w-20 w-full"
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
      <Drawer open={bardcodeScanOpen} onOpenChange={setBarcodeScanOpen}>
        <DrawerContent className="h-5/6 md:h-4/5 flex items-center w-full">
          <DrawerHeader>
            <DrawerTitle>Barcode</DrawerTitle>
            <DrawerDescription>Scan product barcode</DrawerDescription>
          </DrawerHeader>
          <DrawerClose className="absolute top-0 right-0 p-4">
            <X />
          </DrawerClose>
          <div className="flex flex-col items-center justify-center h-full">
            Under construction.
            <Construction className="mx-auto my-4 text-amber-300" size={100} />
          </div>
          <DrawerFooter className="w-full flex justify-center items-center">
            <Button
              className="w-full max-w-xl"
              onClick={() => handleBarcodeSubmit('1234567890')}
            >
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  )
}

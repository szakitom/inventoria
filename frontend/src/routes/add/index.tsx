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
import { DownloadIcon } from 'lucide-react'

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
                    <Input
                      placeholder="Barcode"
                      type="text"
                      inputMode="numeric"
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
                    <div className="flex rounded-md shadow-xs">
                      <Input
                        className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                        placeholder="Email"
                        type="email"
                      />
                      <button
                        className="border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex w-9 items-center justify-center rounded-e-md border text-sm transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Subscribe"
                      >
                        <DownloadIcon size={16} aria-hidden="true" />
                      </button>
                    </div>
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
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex rounded-md shadow-xs">
                        <Input
                          type="email"
                          placeholder="Email address"
                          className="-me-px rounded-e-none shadow-none focus-visible:z-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-s-none"
                        >
                          <DownloadIcon />
                          <span className="sr-only">Download</span>
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
    </main>
  )
}

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

interface EditDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (shelfId: string) => Promise<void>
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  barcode: z.string().optional(),
  expiration: z
    .date()
    .transform((date) => date.toISOString())
    .optional(),
  amount: z.number().min(0, {
    message: 'Amount must be a positive number.',
  }),
  quantity: z.string().optional(),
})

const EditDialog = ({
  isOpen,
  onCancel,
  // onSubmit: submitDialog,
  data: item,
}: EditDialogProps) => {
  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name as string | undefined,
      barcode: item?.barcode as string | undefined,
      expiration: item?.expiration
        ? new Date(item.expiration as string)
        : undefined,
      amount: item?.amount ? Number(item.amount) : 0,
      quantity: item?.quantity as string | undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  if (!isOpen) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="flex max-h-[min(600px,80vh)] md:max-h-[90vh] flex-col gap-0 p-0 sm:max-w-md">
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-6">Edit Item</DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                Editing details for {(item?.name as string) || 'this item'}.
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
                              <Input placeholder="Name" {...field} />
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
                              <Input placeholder="Barcode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expiration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiration</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                placeholder="Expiration"
                                value={
                                  field.value
                                    ? field.value.toISOString().substring(0, 10)
                                    : ''
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : undefined
                                  )
                                }
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
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                        type="submit"
                        disabled={
                          !form.formState.isValid || form.formState.isSubmitting
                        }
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog

import { z } from 'zod'

export class Item {
  static defaultValues = {
    sort: 'name' as const,
    page: 1,
    limit: 10,
    search: '',
    locations: [] as string[],
    shelves: [] as string[],
  }

  static baseSortOptions = [
    { name: 'Name', value: 'name' },
    { name: 'Amount', value: 'amount' },
    { name: 'Expiration', value: 'expiration' },
  ] as const

  static pageLimitOptions = [
    { name: '10', value: 10 },
    { name: '25', value: 25 },
    { name: '50', value: 50 },
    { name: 'All', value: 0 },
  ] as const

  static sortOptions = [
    ...this.baseSortOptions.map((option) => option.value),
    ...this.baseSortOptions.map((option) => `-${option.value}` as const),
  ] as [string, ...string[]]

  static itemSearchSchema = z.object({
    sort: z.enum(this.sortOptions).default(this.defaultValues.sort),
    page: z.number().int().min(1).default(this.defaultValues.page),
    limit: z.number().int().min(0).default(this.defaultValues.limit),
    search: z.string().default(this.defaultValues.search),
    locations: z.array(z.string()).default(this.defaultValues.locations),
    shelves: z.array(z.string()).catch(this.defaultValues.shelves),
  })
}

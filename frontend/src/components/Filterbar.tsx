import { useNavigate, useRouter, type AnyRoute } from '@tanstack/react-router'
import { Suspense, use, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@/components/ui/input'
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  RotateCcw,
} from 'lucide-react'
import { Button } from './ui/button'
import useDebounce from '@/hooks/useDebounce'
import { Item } from '@utils/item'

interface FilterbarProps {
  route: AnyRoute
}

const Filterbar = ({ route }: FilterbarProps) => {
  const search = route.useSearch()
  const data = route.useLoaderData()
  const navigate = useNavigate({ from: route.fullPath })
  const {
    sort: directionSort,
    search: searchTerm,
    locations: selectedLocations,
    limit,
  } = search
  const direction = directionSort.startsWith('-') ? '-' : '+'
  const sort = directionSort.replace(/^-/, '')
  const [searchValue, setSearchValue] = useState(searchTerm || '')
  const [locations, setLocations] = useState<string[]>(selectedLocations || [])
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const debouncedLocations = useDebounce(locations, 300)
  const router = useRouter()

  useEffect(() => {
    const shouldNavigate =
      debouncedSearchValue !== search.search ||
      JSON.stringify(debouncedLocations) !== JSON.stringify(search.locations)

    if (shouldNavigate) {
      navigate({
        search: {
          ...search,
          search: debouncedSearchValue,
          locations: debouncedLocations,
          page: 1,
        },
      })
    }
  }, [debouncedSearchValue, debouncedLocations, navigate, search, searchTerm])

  return (
    <div>
      <pre>{JSON.stringify(search, null, 2)}</pre>

      <div className="flex items-center gap-4">
        <Select
          value={sort}
          onValueChange={(value) =>
            navigate({
              search: {
                ...search,
                sort: value,
              },
            })
          }
        >
          <SelectTrigger className="w-[180px] cursor-pointer">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Item.baseSortOptions.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup type="single" variant="outline" value={direction}>
          <ToggleGroupItem
            value="+"
            aria-label="Ascending order"
            className="cursor-pointer"
            onClick={() =>
              navigate({
                search: {
                  ...search,
                  sort: sort.startsWith('-') ? sort.replace(/^-/, '') : sort,
                },
              })
            }
          >
            {sort.includes('name') ? <ArrowDownAZ /> : <ArrowDown01 />}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="-"
            aria-label="Descending order"
            className="cursor-pointer"
            onClick={() =>
              navigate({
                search: {
                  ...search,
                  sort: sort.startsWith('-') ? sort : `-${sort}`,
                },
              })
            }
          >
            {sort.includes('name') ? <ArrowUpAZ /> : <ArrowUp01 />}
          </ToggleGroupItem>
        </ToggleGroup>
        <Input
          placeholder="Search"
          className="w-[180px]"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <select
          className="w-[180px] cursor-pointer"
          multiple
          value={locations}
          onChange={(e) => {
            setLocations(
              [...e.target.selectedOptions].map((option) =>
                typeof option === 'string' ? option : option.value
              )
            )
          }}
        >
          <Suspense
            fallback={
              <option disabled value="__loading__">
                Loading locations…
              </option>
            }
          >
            <LocationOptions data={data} />
          </Suspense>
        </select>
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            navigate({
              search: {
                ...search,
                limit: parseInt(value),
                page: 1,
              },
            })
          }}
        >
          <SelectTrigger className="w-[180px] cursor-pointer">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {Item.pageLimitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={() => {
            setSearchValue('')
            setLocations([])
            navigate({ search: {} as never })
            router.invalidate()
          }}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  )
}

export default Filterbar

interface Location {
  id: string
  name: string
}

interface LocationOptionsProps {
  data: {
    locations: Promise<Location[]>
  }
}

const LocationOptions = ({ data }: LocationOptionsProps) => {
  const locations = use(data.locations)

  return locations.map((location) => (
    <option key={location.id} value={location.id}>
      {location.name}
    </option>
  ))
}

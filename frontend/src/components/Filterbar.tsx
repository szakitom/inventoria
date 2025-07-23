import { useNavigate, type AnyRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@components/ui/input'
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@components/ui/button'
import useDebounce from '@/hooks/useDebounce'
import { Item } from '@utils/item'
import Multiselect from '@/components/MultiSelect'
import { arraysEqual } from '@utils/index'
import { Label } from '@components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
  } = search
  const direction = directionSort.startsWith('-') ? '-' : '+'
  const sort = directionSort.replace(/^-/, '')
  const [searchValue, setSearchValue] = useState(searchTerm || '')
  const [locations, setLocations] = useState<string[]>(selectedLocations || [])
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const debouncedLocations = useDebounce(locations, 300)

  useEffect(() => {
    const shouldNavigate =
      debouncedSearchValue !== search.search ||
      !arraysEqual(debouncedLocations, search.locations)

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
  }, [debouncedSearchValue, debouncedLocations, navigate, search])

  const handleSortChange = (value: string) => {
    navigate({
      search: {
        ...search,
        sort: direction === '-' ? `-${value}` : value,
      },
    })
  }

  const handleDirectionChange = (value: string) => {
    const newSort = value === '-' ? `-${sort}` : sort
    navigate({
      search: {
        ...search,
        sort: newSort,
      },
    })
  }

  return (
    <nav className="w-full flex gap-4 items-center justify-center p-2 md:p-4 bg-white rounded-md shadow-sm">
      <div className="flex w-full gap-2">
        <div className="flex flex-row items-center gap-2">
          <Label>Sort by</Label>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
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
          <ToggleGroup
            type="single"
            variant="outline"
            value={direction}
            onValueChange={handleDirectionChange}
            aria-label="Sort direction"
          >
            <ToggleGroupItem
              value="+"
              aria-label="Ascending order"
              className="cursor-pointer px-3 py-1 hover:bg-gray-100 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              {sort.includes('name') ? (
                <ArrowDownAZ size={16} />
              ) : (
                <ArrowDown01 size={16} />
              )}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="-"
              aria-label="Descending order"
              className="cursor-pointer px-3 py-1 hover:bg-gray-100 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              {sort.includes('name') ? (
                <ArrowUpAZ size={16} />
              ) : (
                <ArrowUp01 size={16} />
              )}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Input
          placeholder="Search"
          className="min-w-[160px] max-w-[280px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <Multiselect
          options={data}
          value={locations}
          selectedText="location selected"
          dataKey="locations"
          optionLabel="name"
          optionValue="id"
          onSelect={setLocations}
          className="max-w-[200px]"
        />
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset filters"
            className="cursor-pointer"
            onClick={() => {
              setSearchValue('')
              setLocations([])
              navigate({ search: {} as never })
            }}
          >
            <RotateCcw size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset</p>
        </TooltipContent>
      </Tooltip>
    </nav>
  )
}

export default Filterbar

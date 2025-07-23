import { useNavigate, type AnyRoute } from '@tanstack/react-router'
import { useEffect, useId, useState, useTransition } from 'react'
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
import { cn } from '@/lib/utils'
import { Spinner } from './ui/spinner'

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
  const id = useId()
  const direction = directionSort.startsWith('-') ? '-' : '+'
  const sort = directionSort.replace(/^-/, '')
  const [searchValue, setSearchValue] = useState(searchTerm || '')
  const [locations, setLocations] = useState<string[]>(selectedLocations || [])
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const debouncedLocations = useDebounce(locations, 300)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const shouldNavigate =
      debouncedSearchValue !== search.search ||
      !arraysEqual(debouncedLocations, search.locations)

    if (shouldNavigate) {
      startTransition(() => {
        navigate({
          search: {
            ...search,
            search: debouncedSearchValue,
            locations: debouncedLocations,
            page: 1,
          },
        })
      })
    }
  }, [debouncedSearchValue, debouncedLocations, navigate, search])

  const handleSortChange = (value: string) => {
    startTransition(() => {
      navigate({
        search: {
          ...search,
          sort: direction === '-' ? `-${value}` : value,
        },
      })
    })
  }

  const handleDirectionChange = (value: string) => {
    const newSort = value === '-' ? `-${sort}` : sort
    startTransition(() => {
      navigate({
        search: {
          ...search,
          sort: newSort,
        },
      })
    })
  }

  const resetFilters = () => {
    setSearchValue('')
    setLocations([])
    startTransition(() => {
      navigate({ search: {} as never })
    })
  }

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <nav className="bg-white w-full flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:items-center">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 w-full">
              <Label
                htmlFor={id}
                className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer"
              >
                Sort by
              </Label>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger
                  id={id}
                  className="w-full md:w-[200px] focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
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
                  aria-label="Ascending"
                  className="cursor-pointer px-2 py-1 hover:bg-gray-100 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  {sort.includes('name') ? (
                    <ArrowDownAZ size={16} />
                  ) : (
                    <ArrowDown01 size={16} />
                  )}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="-"
                  aria-label="Descending"
                  className="cursor-pointer px-2 py-1 hover:bg-gray-100 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  {sort.includes('name') ? (
                    <ArrowUpAZ size={16} />
                  ) : (
                    <ArrowUp01 size={16} />
                  )}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Spinner
              isPending={isPending}
              className="text-muted-foreground md:hidden "
            />

            <ResetButton onClick={resetFilters} className="flex md:hidden" />
          </div>

          <Input
            placeholder="Search"
            className="w-full sm:w-[200px] md:w-[240px] focus:ring-2 focus:ring-blue-500"
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
            className="w-full sm:w-[200px] max-w-full"
          />
          <Spinner
            isPending={isPending}
            className="text-muted-foreground hidden md:flex "
          />
        </div>

        <ResetButton onClick={resetFilters} className="hidden md:flex" />
      </nav>
    </header>
  )
}

export default Filterbar

const ResetButton = ({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        aria-label="Reset filters"
        className={cn(
          'self-end md:self-center cursor-pointer hover:bg-gray-100',
          className
        )}
        onClick={onClick}
      >
        <RotateCcw size={20} />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Reset</p>
    </TooltipContent>
  </Tooltip>
)

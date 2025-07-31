import { createElement, Suspense, use, useId, useState } from 'react'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { getLocationIcon } from '@utils/index'

export interface Location {
  id: string
  name: string
  type?: string
  shelves: Shelf[]
  count?: number
}

export interface Shelf {
  id: string
  name: string
}

const LocationSelect = ({
  currentLocation,
  currentShelf,
  locations,
  onSelect,
  withDefaultShelf = false,
  label,
  shelfLabel,
}: {
  currentLocation?: Location
  currentShelf?: Shelf
  locations: Promise<Location[]>
  onSelect?: (shelfId: string) => void
  withDefaultShelf?: boolean
  label?: React.ReactNode
  shelfLabel?: React.ReactNode
}) => {
  const [selectedLocation, setLocation] = useState<string>(
    currentLocation?.id || ''
  )
  const [selectedShelf, setShelf] = useState<string>(
    withDefaultShelf ? currentShelf?.id || '' : ''
  )

  const locationSelectId = useId()
  const shelfSelectId = useId()

  const handleLocationChange = (value: string) => {
    setLocation(value)
    setShelf('')
    onSelect?.('')
  }

  const handleShelfChange = (value: string) => {
    setShelf(value)
    onSelect?.(value)
  }

  return (
    <div className="grid gap-4">
      {label ?? (
        <Label
          htmlFor={locationSelectId}
          className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer"
        >
          New location
        </Label>
      )}
      <Select value={selectedLocation} onValueChange={handleLocationChange}>
        <SelectTrigger
          id={locationSelectId}
          className="w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <SelectValue placeholder="Location" />
        </SelectTrigger>

        <SelectContent>
          <Suspense
            fallback={
              <SelectItem disabled value="__loading__">
                Loading...
              </SelectItem>
            }
          >
            <SuspendedOptions
              data={locations}
              filterFn={(list: Location[]) => list}
              mapFn={(item) => {
                const loc = item as Location
                return {
                  key: loc.id,
                  value: loc.id,
                  label: loc.name,
                  type: loc.type,
                }
              }}
            />
          </Suspense>
        </SelectContent>
      </Select>
      {selectedLocation && (
        <>
          {shelfLabel ?? (
            <Label
              htmlFor={shelfSelectId}
              className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer"
            >
              New shelf
            </Label>
          )}
          <Select value={selectedShelf} onValueChange={handleShelfChange}>
            <SelectTrigger
              id={shelfSelectId}
              className="w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <SelectValue placeholder="Select a Shelf" />
            </SelectTrigger>
            <SelectContent>
              <Suspense
                fallback={
                  <SelectItem disabled value="__loading__">
                    Loading...
                  </SelectItem>
                }
              >
                <SuspendedOptions
                  data={locations}
                  filterFn={(list: Location[]) => {
                    const location = list.find((l) => l.id === selectedLocation)
                    return location?.shelves ?? []
                  }}
                  mapFn={(item) => {
                    const shelf = item as Shelf
                    return {
                      key: shelf.id,
                      value: shelf.id,
                      label: shelf.name,
                      disabled:
                        !withDefaultShelf && currentShelf
                          ? shelf.id === currentShelf.id
                          : false,
                    }
                  }}
                />
              </Suspense>
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  )
}

export default LocationSelect

interface SuspendedOptionsProps<T = unknown> {
  data: Promise<T> | T
  filterFn?: (data: T) => Array<unknown>
  mapFn: (item: unknown) => {
    key: string
    value: string
    label: string
    disabled?: boolean
    type?: string
  }
}

const SuspendedOptions = <T,>({
  data,
  filterFn = (d) => d as unknown[],
  mapFn,
}: SuspendedOptionsProps<T>) => {
  const resolved = use(data instanceof Promise ? data : Promise.resolve(data))
  const list = filterFn(resolved)

  if (!list || list.length === 0) {
    return (
      <SelectItem value="" disabled>
        No options available
      </SelectItem>
    )
  }

  return (
    <>
      {list.map((item) => {
        const { key, value, label, disabled, type } = mapFn(item)
        return (
          <SelectItem key={key} value={value} disabled={disabled}>
            {type &&
              createElement(getLocationIcon(type), {
                className: 'h-4 w-4 text-blue-500',
              })}
            {label}
          </SelectItem>
        )
      })}
    </>
  )
}

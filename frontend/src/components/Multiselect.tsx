import {
  createElement,
  Suspense,
  use,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { arraysEqual, getLocationIcon } from '@/utils/index'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Command, CommandItem, CommandList } from '@components/ui/command'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'

interface OptionType {
  [key: string]: string
}

interface MultiselectProps {
  options: { [key: string]: Promise<OptionType[]> }
  value: string[]
  selectedText: string
  dataKey: string
  optionLabel: string
  optionValue: string
  onSelect: (selected: string[]) => void
  className?: string
  optionLabelFn?: (label: string) => string
}

interface OptionsProps {
  data: { [key: string]: Promise<OptionType[]> }
  onSelect: (value: string) => void
  selected: string[]
  dataKey: string
  optionLabel: string
  optionValue: string
  optionLabelFn?: (label: string) => string
}

const Multiselect = ({
  options,
  value,
  selectedText,
  dataKey,
  optionLabel,
  optionValue,
  onSelect,
  className,
  optionLabelFn,
}: MultiselectProps) => {
  const [open, setOpen] = useState(false)
  const memoizedData = useDeferredValue(options)
  const id = useId()
  const [selected, setSelected] = useState<string[]>(value || [])
  const selectedRef = useRef<string[]>(selected)

  useEffect(() => {
    if (
      value &&
      Array.isArray(value) &&
      !arraysEqual(value, selectedRef.current)
    ) {
      setSelected(value)
      selectedRef.current = value
      return
    }

    if (!arraysEqual(selected, selectedRef.current)) {
      selectedRef.current = selected
      onSelect(selected)
    }
  }, [value, selected, onSelect])

  const handleSelect = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={className}>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
        >
          <span className="flex items-center ">
            <Badge variant="outline">
              {selected.length === 0 ? 'All' : selected.length}
            </Badge>
            &nbsp;{selectedText}
          </span>

          <ChevronsUpDownIcon
            size={16}
            className="text-muted-foreground/80 shrink-0"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
        <Command>
          <CommandList>
            <Suspense fallback={<CommandItem disabled>Loading...</CommandItem>}>
              <Options
                data={memoizedData}
                onSelect={handleSelect}
                selected={selected}
                dataKey={dataKey}
                optionLabel={optionLabel}
                optionValue={optionValue}
                optionLabelFn={optionLabelFn}
              />
            </Suspense>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Multiselect

const Options = ({
  data,
  onSelect,
  selected,
  dataKey,
  optionLabel,
  optionValue,
  optionLabelFn,
}: OptionsProps) => {
  const options = use(data[dataKey]) as OptionType[]
  if (!options || options.length === 0) {
    return <CommandItem disabled>No options available</CommandItem>
  }

  return options.map((option) => (
    <CommandItem
      key={option[optionValue]}
      value={option[optionValue]}
      onSelect={() => onSelect(option[optionValue])}
      className="cursor-pointer"
    >
      {option.type &&
        createElement(getLocationIcon(option.type), {
          className: 'h-4 w-4 text-blue-500',
        })}
      <span className="truncate">
        {optionLabelFn
          ? optionLabelFn(option[optionLabel])
          : option[optionLabel]}
      </span>
      {selected.includes(option[optionValue]) && (
        <CheckIcon size={16} className="ml-auto" />
      )}
    </CommandItem>
  ))
}

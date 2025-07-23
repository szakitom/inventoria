import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Command, CommandItem, CommandList } from '@components/ui/command'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import {
  Suspense,
  use,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { arraysEqual } from '@utils/index'

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
}

interface OptionsProps {
  data: { [key: string]: Promise<OptionType[]> }
  onSelect: (value: string) => void
  selected: string[]
  dataKey: string
  optionLabel: string
  optionValue: string
}

const Multiselect = ({
  options,
  value,
  selectedText,
  dataKey,
  optionLabel,
  optionValue,
  onSelect,
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
    <div className="w-full max-w-xs">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className=" w-full justify-between cursor-pointer hover:bg-transparent"
          >
            <span>
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
              <Suspense
                fallback={<CommandItem disabled>Loading...</CommandItem>}
              >
                <Options
                  data={memoizedData}
                  onSelect={handleSelect}
                  selected={selected}
                  dataKey={dataKey}
                  optionLabel={optionLabel}
                  optionValue={optionValue}
                />
              </Suspense>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
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
      <span className="truncate">{option[optionLabel]}</span>
      {selected.includes(option[optionValue]) && (
        <CheckIcon size={16} className="ml-auto" />
      )}
    </CommandItem>
  ))
}

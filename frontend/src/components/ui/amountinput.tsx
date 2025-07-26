import { useRef, useState } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AmountInput({
  value,
  onChange,
}: {
  value: number
  onChange: (newValue: number) => void
}) {
  const [inputValue, setValue] = useState<number>(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const applyValue = (val: string) => {
    if (val === '') {
      setValue(NaN)
      return
    }

    const parsed = parseInt(val)
    if (!isNaN(parsed)) {
      setValue(parsed)
      onChange(parsed)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyValue(e.target.value)
  }

  const increment = () => {
    const current = isNaN(inputValue) ? 0 : inputValue
    const next = current + 1
    applyValue(next.toString())
  }

  const decrement = () => {
    const current = isNaN(inputValue) ? 0 : inputValue
    const next = current - 1
    if (next <= 0) {
      applyValue('')
      inputRef.current?.focus()
    } else {
      applyValue(next.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }

  return (
    <div className="w-full flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={decrement}
        className="h-9 w-9 rounded-none border-r cursor-pointer"
      >
        <MinusIcon className="w-4 h-4" />
      </Button>
      <Input
        type="text"
        min={1}
        pattern="[0-9]+"
        inputMode="numeric"
        value={isNaN(inputValue) ? '' : inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        className="h-9 w-full text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-none"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={increment}
        className="h-9 w-9 rounded-none border-l cursor-pointer"
      >
        <PlusIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}

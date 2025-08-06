'use client'

import { useEffect, useId, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'

interface CheckboxCardProps {
  title: string
  description?: string
  defaultChecked?: boolean
  expandable?: boolean
  placeholder?: string
  onCheckedChange?: (checked: boolean) => void
  renderExpanded?: () => React.ReactNode
}
interface CheckboxCardProps {
  title: string
  description?: string
  defaultChecked?: boolean
  expandable?: boolean
  placeholder?: string
  onCheckedChange?: (checked: boolean) => void
  renderExpanded?: () => React.ReactNode
}

const CheckboxCard = ({
  title,
  description,
  defaultChecked = false,
  expandable = false,
  placeholder = 'Enter details',
  onCheckedChange,
  renderExpanded,
}: CheckboxCardProps) => {
  const checkboxId = useId()
  const inputId = useId()
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(
    defaultChecked
  )

  useEffect(() => {
    onCheckedChange?.(!!checked)
  }, [checked, onCheckedChange])

  return (
    <Label
      htmlFor={checkboxId}
      className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-3 transition-all
        has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50
        dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
    >
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={setChecked}
        aria-describedby={`${checkboxId}-description`}
        aria-controls={expandable ? inputId : undefined}
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white
          dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grow">
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">{title}</p>
          {description && (
            <p
              id={`${checkboxId}-description`}
              className="text-muted-foreground text-sm"
            >
              {description}
            </p>
          )}
        </div>
        <Collapsible open={!!checked}>
          <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300">
            <div className="mt-3">
              {renderExpanded ? (
                renderExpanded()
              ) : (
                <Input
                  type="text"
                  placeholder={placeholder}
                  disabled={!checked}
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Label>
  )
}

export { CheckboxCard }

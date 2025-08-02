import { useEffect, useState } from 'react' // or remove if not using `cn`
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  isPending?: boolean
  minDuration?: number // default to 300ms
}

const Spinner = ({
  isPending = true,
  minDuration = 300,
  className,
}: SpinnerProps) => {
  const [show, setShow] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (isPending) {
      setStartTime(Date.now())
      setShow(true)
    } else if (startTime) {
      const elapsed = Date.now() - startTime
      if (elapsed < minDuration) {
        const timeout = setTimeout(() => {
          setShow(false)
          setStartTime(null)
        }, minDuration - elapsed)
        return () => clearTimeout(timeout)
      } else {
        setShow(false)
        setStartTime(null)
      }
    }
  }, [isPending, minDuration, startTime])

  return (
    <Loader2
      className={cn(
        'w-5 h-5 animate-spin',
        show ? 'visible' : 'invisible',
        className
      )}
    />
  )
}

export { Spinner }

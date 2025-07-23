import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const Spinner = ({ className = 'w-4 h-4' }: { className?: string }) => {
  return <Loader2 className={cn('animate-spin', className)} />
}

export { Spinner }

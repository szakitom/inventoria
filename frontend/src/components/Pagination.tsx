import { useId, useTransition } from 'react'
import { useNavigate, type AnyRoute } from '@tanstack/react-router'
import {
  Pagination as PaginationShad,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Item } from '@utils/item'
import { ChevronFirstIcon, ChevronLastIcon } from 'lucide-react'
import { Spinner } from './ui/spinner'

interface PaginationProps {
  route: AnyRoute
}

const Pagination = ({ route }: PaginationProps) => {
  const search = route.useSearch()
  const data = route.useLoaderData()
  const navigate = useNavigate({ from: route.fullPath })
  const { pages: pageCount } = data.items
  const { page: currentPage, limit } = search
  const [isPending, startTransition] = useTransition()

  const id = useId()

  const visiblePages = getVisiblePages(currentPage, pageCount)

  const goToPage = (page: number) => {
    startTransition(() => {
      navigate({ search: { ...search, page: page } })
    })
  }

  const changeLimit = (value: string) => {
    startTransition(() => {
      navigate({
        search: {
          ...search,
          limit: parseInt(value),
          page: 1,
        },
      })
    })
  }

  return (
    <nav className="flex items-center space-x-4 p-4">
      <div className="flex items-center gap-2 w-[220px]">
        <Label htmlFor={id} className="">
          Rows per page
        </Label>

        <Select value={limit.toString()} onValueChange={changeLimit}>
          <SelectTrigger id={id} className="">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent className="">
            {Item.pageLimitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Spinner
        className={cn(
          'w-6 h-6 text-muted-foreground',
          isPending ? 'visible' : 'invisible'
        )}
      />

      <PaginationShad className="w-full items-center">
        <PaginationContent className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <PaginationItem>
              <PaginationLink
                aria-label="Go to first page"
                size="icon"
                className={cn(
                  'cursor-pointer',
                  currentPage <= 1 && 'pointer-events-none opacity-50'
                )}
                onClick={() => goToPage(1)}
              >
                <ChevronFirstIcon className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
                className={cn(
                  'cursor-pointer select-none',
                  currentPage <= 1 && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>
          </div>

          <div className="flex items-center gap-2 w-full justify-center">
            {visiblePages.map((page, idx) =>
              page === '...' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationNumber
                  key={page}
                  page={page}
                  currentPage={currentPage}
                  handleClick={() => goToPage(page)}
                />
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(Math.min(pageCount, currentPage + 1))}
                aria-disabled={currentPage >= pageCount}
                tabIndex={currentPage >= pageCount ? -1 : undefined}
                className={cn(
                  'cursor-pointer select-none',
                  currentPage >= pageCount && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                aria-label="Go to last page"
                size="icon"
                className={cn(
                  'cursor-pointer',
                  currentPage >= pageCount && 'pointer-events-none opacity-50'
                )}
                onClick={() => goToPage(pageCount)}
              >
                <ChevronLastIcon className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          </div>
        </PaginationContent>
      </PaginationShad>
    </nav>
  )
}

export default Pagination

const getVisiblePages = (
  current: number,
  total: number
): (number | '...')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (current <= 4) {
    for (let i = 2; i <= Math.min(5, total - 1); i++) {
      pages.push(i)
    }
    pages.push('...')
  } else if (current >= total - 3) {
    pages.push('...')
    for (let i = Math.max(total - 4, 2); i < total; i++) {
      pages.push(i)
    }
  } else {
    pages.push('...')
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i)
    }
    pages.push('...')
  }

  pages.push(total)

  return pages
}

interface PaginationNumberProps {
  handleClick: () => void
  page: number
  currentPage: number
}

const PaginationNumber = ({
  handleClick,
  page,
  currentPage,
}: PaginationNumberProps) => {
  return (
    <PaginationItem>
      <PaginationLink
        onClick={handleClick}
        isActive={page === currentPage}
        className="cursor-pointer"
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </PaginationLink>
    </PaginationItem>
  )
}

import { useId, useRef } from 'react'
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
  navigate: (
    options: Parameters<ReturnType<typeof useNavigate>>[0]
  ) => Promise<void>
  isPending?: boolean
}

const Pagination = ({ route, navigate, isPending }: PaginationProps) => {
  const search = route.useSearch()
  const data = route.useLoaderData()
  const { pages: pageCount, total, items: currentItems } = data.items
  const { page: currentPage, limit } = search
  const activePageRef = useRef<HTMLDivElement | null>(null)

  const id = useId()

  const visiblePages = getVisiblePages(currentPage, pageCount)

  const goToPage = (page: number) => {
    navigate({ search: { ...search, page } })
  }

  const changeLimit = (value: string) => {
    navigate({
      search: {
        ...search,
        limit: parseInt(value),
        page: 1,
      },
    })
  }

  return (
    <footer className="flex flex-col md:flex-row items-center md:space-x-4 p-4 gap-4 w-full">
      <div className="flex items-center gap-2 w-full md:w-[250px] mr-0 justify-between md:justify-evenly">
        <Label
          htmlFor={id}
          className="cursor-pointer h-full w-full whitespace-nowrap"
        >
          Rows per page
        </Label>

        <Select value={limit.toString()} onValueChange={changeLimit}>
          <SelectTrigger
            id={id}
            className="cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-2 dark:focus:ring-blue-500"
            aria-labelledby={id}
          >
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {Item.pageLimitOptions.map((option) => (
              <SelectItem
                className="cursor-pointer"
                key={option.value}
                value={option.value.toString()}
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium whitespace-nowrap">
          Showing items {limit * (currentPage - 1) + 1} -{' '}
          {limit * (currentPage - 1) + currentItems.length} of {total}
        </Label>
      </div>

      {pageCount > 1 ? (
        <PaginationShad className="w-full items-center">
          <PaginationContent className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <PaginationItem>
                <PaginationLink
                  aria-label="Go to first page"
                  size="icon"
                  className={cn(
                    'cursor-pointer hidden md:visible',
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

            <div
              className="flex items-center gap-2 w-full justify-center overflow-x-auto scrollbar-hide"
              // IDEA: check out scrollarea
            >
              {visiblePages.map((page, idx) =>
                page === '...' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <div
                    key={page}
                    ref={page === currentPage ? activePageRef : null}
                  >
                    {/* IDEA: onclick should display a popup to go to given page */}
                    {isPending && page === currentPage ? (
                      <PaginationItem key={page}>
                        <PaginationLink isActive className="cursor-default">
                          <Spinner
                            isPending={isPending}
                            className="text-muted-foreground"
                          />
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationNumber
                        page={page}
                        currentPage={currentPage}
                        handleClick={() => goToPage(page)}
                      />
                    )}
                  </div>
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
                    'cursor-pointer hidden md:visible',
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
      ) : null}
    </footer>
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
        className="cursor-pointer select-none focus:outline-none data-[active=true]:bg-blue-500 data-[active=true]:text-white dark:data-[active=true]:bg-blue-800"
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </PaginationLink>
    </PaginationItem>
  )
}

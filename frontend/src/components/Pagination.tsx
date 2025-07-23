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

interface PaginationProps {
  route: AnyRoute
}

const Pagination = ({ route }: PaginationProps) => {
  const search = route.useSearch()
  const data = route.useLoaderData()
  const navigate = useNavigate({ from: route.fullPath })
  const { pages: pageCount } = data.items
  const { page: currentPage } = search
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  if (pageCount <= 1) {
    return null
  }

  return (
    <nav>
      <PaginationShad>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                navigate({
                  search: { ...search, page: Math.max(1, currentPage - 1) },
                })
              }
              aria-disabled={currentPage <= 1}
              tabIndex={currentPage <= 1 ? -1 : undefined}
              className={cn(
                'cursor-pointer',
                currentPage <= 1 ? 'pointer-events-none opacity-50' : undefined
              )}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationNumber
              key={page}
              page={page}
              currentPage={currentPage}
              handleClick={() => {
                navigate({ search: { ...search, page: page } })
              }}
            />
          ))}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                navigate({
                  search: {
                    ...search,
                    page: Math.min(pageCount, currentPage + 1),
                  },
                })
              }
              aria-disabled={currentPage >= pageCount}
              tabIndex={currentPage >= pageCount ? -1 : undefined}
              className={cn(
                'cursor-pointer',
                currentPage >= pageCount
                  ? 'pointer-events-none opacity-50'
                  : undefined
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationShad>
    </nav>
  )
}

export default Pagination

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

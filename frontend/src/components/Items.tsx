import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useSearch } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useDialog } from '@/hooks/useDialog'
import Item from '@/components/Item'
import DeleteDialog from '@/components/DeleteDialog'
import MoveDialog from '@/components/MoveDialog'
import EditDialog from '@/components/EditDialog'
import ImageDialog from '@/components/ImageDialog'
import type { IItem } from '@/utils/index'

const variants = {
  enter: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? 50 : -50,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? -50 : 50,
    opacity: 0,
  }),
}
interface ItemsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: any
  from: '/' | '/locations/$location/'
}

const Items = ({ navigate, from }: ItemsProps) => {
  const {
    items: { items: incomingItems, pages: totalPages },
  } = useLoaderData({ from })
  const search = useSearch({ from })
  const page = search.page

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)

    return () => clearTimeout(timeout)
  }, [page])

  const prevPageRef = useRef<number>(page)
  const [items, setItems] = useState(incomingItems)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const dragThreshold = 5
  const isDraggingRef = useRef(false)
  const swipeThreshold = 180
  const minSwipeVelocity = 300

  const parentRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(4)

  const minItemWidth = 300
  const gridGap = 16

  useEffect(() => {
    const setInitialColumnCount = () => {
      const width = window.innerWidth
      if (width < 640) return setColumnCount(1) // sm
      if (width < 768) return setColumnCount(2) // md
      if (width < 1024) return setColumnCount(3) // lg
      const estimatedColumns = Math.max(
        1,
        Math.floor((width - gridGap * 2) / (minItemWidth + gridGap))
      )
      setColumnCount(estimatedColumns)
    }

    setInitialColumnCount()

    const updateColumnCount = () => {
      if (!parentRef.current) return

      const containerWidth = parentRef.current.clientWidth - gridGap * 2

      const columns = Math.max(
        1,
        Math.floor((containerWidth + gridGap) / (minItemWidth + gridGap))
      )

      setColumnCount(columns)
    }

    const resizeObserver = new ResizeObserver(updateColumnCount)

    const timeoutId = setTimeout(() => {
      if (parentRef.current) {
        resizeObserver.observe(parentRef.current)
        updateColumnCount()
      }
    }, 0)

    window.addEventListener('resize', updateColumnCount)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateColumnCount)
    }
  }, [])

  const rowCount = Math.ceil(items.length / columnCount)

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 300,
    scrollMargin: 0,
    overscan: 5,
    paddingStart: 0,
    paddingEnd: 0,
    measureElement: (element) => {
      return element.getBoundingClientRect().height
    },
  })

  useDialog(DeleteDialog, 'delete')
  useDialog(MoveDialog, 'move')
  useDialog(EditDialog, 'edit')
  useDialog(ImageDialog, 'image')

  if (prevPageRef.current !== page) {
    setDirection(page > prevPageRef.current ? 'next' : 'prev')
    prevPageRef.current = page
  }

  useEffect(() => {
    setItems(incomingItems)
  }, [incomingItems])

  const setParentRef = (element: HTMLDivElement | null) => {
    if (element && element !== parentRef.current) {
      parentRef.current = element
      const containerWidth = element.clientWidth - gridGap * 2
      const columns = Math.max(
        1,
        Math.floor((containerWidth + gridGap) / (minItemWidth + gridGap))
      )

      setColumnCount(columns)

      setTimeout(() => {
        if (parentRef.current) {
          const updatedWidth = parentRef.current.clientWidth - gridGap * 2
          const updatedColumns = Math.max(
            1,
            Math.floor((updatedWidth + gridGap) / (minItemWidth + gridGap))
          )
          setColumnCount(updatedColumns)
        }
      }, 100)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground md:min-h-[75dvh]">
        No items found.
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <div
        className="relative overflow-hidden w-full pt-2 md:px-4 md:pt-4 md:min-h-[75dvh] pl-[calc(env(safe-area-inset-left)+0.5rem)] pr-[calc(env(safe-area-inset-right)+0.5rem)] md:pl-[calc(env(safe-area-inset-left)+1rem)] md:pr-[calc(env(safe-area-inset-right)+1rem)]"
        ref={setParentRef}
      >
        <motion.div
          key={page}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            isDraggingRef.current = Math.abs(info.offset.x) > dragThreshold

            if (
              info.offset.x < -swipeThreshold &&
              info.velocity.x < -minSwipeVelocity &&
              page < totalPages
            ) {
              navigate({
                search: (prev: Record<string, unknown>) => ({
                  ...prev,
                  page: page + 1,
                }),
              })
            } else if (
              info.offset.x > swipeThreshold &&
              info.velocity.x > minSwipeVelocity &&
              page > 1
            ) {
              navigate({
                search: (prev: Record<string, unknown>) => ({
                  ...prev,
                  page: page - 1,
                }),
              })
            }
          }}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="relative w-full touch-pan-y select-none active:cursor-grabbing"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowItems: IItem[] = []
            for (let col = 0; col < columnCount; col++) {
              const itemIndex = virtualRow.index * columnCount + col
              if (itemIndex < items.length) {
                rowItems.push(items[itemIndex])
              }
            }

            return (
              <div
                key={virtualRow.key}
                ref={(el) => rowVirtualizer.measureElement(el)}
                data-index={virtualRow.index}
                className="absolute top-0 left-0 w-full grid gap-4 pb-4"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                }}
              >
                {rowItems.map((item: IItem) => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      if (isDraggingRef.current) {
                        e.preventDefault()
                        e.stopPropagation()
                      }
                    }}
                  >
                    <Item item={item} from={from} />
                  </div>
                ))}
              </div>
            )
          })}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Items

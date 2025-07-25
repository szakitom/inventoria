import { useEffect, useRef, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import Item from './Item'
import { useDialog } from '@/hooks/useDialog'
import DeleteDialog from './DeleteDialog'
import MoveDialog from './MoveDialog'

const variants = {
  enter: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? 150 : -150,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? -150 : 150,
    opacity: 0,
  }),
}

export const LocationType = {
  Freezer: 'Freezer',
  Refrigerator: 'Refrigerator',
  Pantry: 'Pantry',
  Other: 'Other',
} as const

export interface IItem {
  id: string
  name: string
  location: {
    location: {
      name: string
      type: (typeof LocationType)[keyof typeof LocationType]
    }
    name: string
  }
  barcode: string
  quantity?: string | number
  expiration?: string
  createdAt: string
  expiresIn?: number
  amount?: string | number
}

const route = getRouteApi('/')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Items = ({ navigate }: { navigate: any }) => {
  const {
    items: { items: incomingItems, pages: totalPages },
  } = route.useLoaderData()
  const search = route.useSearch()
  const page = search.page
  // const navigate = useNavigate({ from: '/' })

  const prevPageRef = useRef<number>(page)
  const [items, setItems] = useState(incomingItems)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const dragThreshold = 5
  const isDraggingRef = useRef(false)
  const swipeThreshold = 180
  const minSwipeVelocity = 300

  useDialog(DeleteDialog, 'delete')
  useDialog(MoveDialog, 'move')

  if (prevPageRef.current !== page) {
    setDirection(page > prevPageRef.current ? 'next' : 'prev')
    prevPageRef.current = page
  }

  useEffect(() => {
    setItems(incomingItems)
  }, [incomingItems])

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <div className="relative overflow-hidden w-full p-4">
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
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 touch-pan-y select-none  active:cursor-grabbing"
        >
          {items.map((item: IItem) => (
            <div
              key={item.id}
              onClick={(e) => {
                if (isDraggingRef.current) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <Item item={item} />
            </div>
          ))}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Items

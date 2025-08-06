import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useSearch } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import Item from './Item'
import { useDialog } from '@/hooks/useDialog'
import DeleteDialog from './DeleteDialog'
import MoveDialog from './MoveDialog'
import EditDialog from './EditDialog'

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
  locationName?: string
  shelfName?: string
  barcode: string
  quantity?: string | number
  expiration?: string | null
  createdAt: string
  expiresIn?: number
  amount?: string | number
  openFoodFacts?: {
    code: string
    nutriments: {
      'energy-kj_100g': number
      'energy-kcal_100g': number
      fat_100g: number
      'saturated-fat_100g': number
      sugars_100g: number
      proteins_100g: number
      salt_100g: number
      carbohydrates_100g: number
    }
    product_name: string
    selected_images: {
      front: {
        display: { [lang: string]: string }
        small: { [lang: string]: string }
        thumb: { [lang: string]: string }
      }
    }
  }
  imageUrl?: string
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

  useDialog(DeleteDialog, 'delete')
  useDialog(MoveDialog, 'move')
  useDialog(EditDialog, 'edit')

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
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
           xl:grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-4 touch-pan-y select-none  active:cursor-grabbing"
        >
          {items.length === 0 ? (
            <div className="text-center col-span-full text-muted-foreground">
              No items found.
            </div>
          ) : (
            items.map((item: IItem) => (
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
            ))
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Items

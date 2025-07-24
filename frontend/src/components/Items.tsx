import { useEffect, useRef, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'

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

interface IItem {
  id: string
  name: string
  location: {
    location: {
      name: string
    }
    name: string
  }
  barcode: string
  quantity?: string | number
  expiration?: string
  createdAt: string
  expiresIn?: string
  amount?: string | number
}

const route = getRouteApi('/')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Items = ({ navigate }: { navigate: any }) => {
  const {
    items: { items: incomingItems, pages: totalPages },
  } = route.useLoaderData()
  console.log(route.useLoaderData())
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

  if (prevPageRef.current !== page) {
    setDirection(page > prevPageRef.current ? 'next' : 'prev')
    prevPageRef.current = page
  }

  useEffect(() => {
    setItems(incomingItems)
  }, [incomingItems])

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <div className="relative overflow-hidden w-full">
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
              className="p-4 border-b"
              onClick={(e) => {
                if (isDraggingRef.current) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">
                Location: {item.location.location.name}
              </p>
              <p className="text-sm text-gray-600">
                Shelf: {item.location.name}
              </p>
              <p className="text-sm text-gray-600">Barcode: {item.barcode}</p>
              <p className="text-sm text-gray-600">
                Quantity: {item.quantity || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                Expiration: {item.expiration || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                Created At: {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Expires In: {item.expiresIn || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                Amount: {item.amount || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">ID: {item.id}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Items

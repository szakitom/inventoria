import { useLoaderData } from '@tanstack/react-router'
import { Suspense, use, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Marquee from 'react-fast-marquee'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { getExpirationStatus } from '@utils/index'
import type { IItem } from './Items'
import { Spinner } from './ui/spinner'

interface FeatureBarProps {
  from: '/'
}

const FeatureBar = ({ from }: FeatureBarProps) => {
  const data = useLoaderData({ from })
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      layout
      className="bg-muted-foreground/50 text-muted w-full shadow-sm"
    >
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <Button
            onClick={() => setOpen(true)}
            variant="ghost"
            className="w-full rounded-none cursor-pointer text-white hover:bg-transparent px-4 py-3"
          >
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between w-full"
            >
              <p className="flex text-sm font-medium items-center">
                <span className="me-1 text-base leading-none">✨</span>
                Featured items
              </p>
              <ArrowDown className="ms-2 h-5 w-5 cursor-pointer" />
            </motion.div>
          </Button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 50 }}
            animate={{ opacity: 1, height: 160 }}
            exit={{ opacity: 0, height: 50 }}
            transition={{ duration: 0.3 }}
            className="w-full origin-top pt-4 flex flex-col justify-between items-center"
          >
            <Suspense
              fallback={
                <div className="flex gap-2 h-full w-full items-center justify-center">
                  <Spinner className="h-6 w-6" />
                  Loading...
                </div>
              }
            >
              <SuspendedMarquee data={data.featured} />
            </Suspense>
            <Button
              size="icon"
              variant="ghost"
              className="w-full rounded-none cursor-pointer text-white hover:bg-transparent"
              onClick={() => setOpen(false)}
            >
              <ArrowUp className=" cursor-pointer" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FeatureBar

interface SuspendedMarqueeProps {
  data: Promise<IItem[]> | IItem[]
}
const SuspendedMarquee = ({ data }: SuspendedMarqueeProps) => {
  const items = use(data instanceof Promise ? data : Promise.resolve(data))

  return (
    <Marquee speed={20} autoFill pauseOnHover className="h-full w-full">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'mx-2 min-w-[160px] bg-white text-gray-800 py-2 px-4 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center',
            getExpirationStatus(item.expiresIn).color
          )}
        >
          <h3 className="text-sm font-semibold mb-1">{item.name}</h3>
          <p className="text-sm text-gray-500">Amount: {item.amount}</p>
          <p className="text-sm text-gray-500">
            Location: {item.locationName} -{' '}
            {item.shelfName?.replace('Shelf ', '')}
          </p>
          <p className="text-sm text-gray-500">Expires in: {item.expiresIn}</p>
        </div>
      ))}
    </Marquee>
  )
}

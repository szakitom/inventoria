import { useLoaderData } from '@tanstack/react-router'
import { Suspense, use, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
      className="bg-blue-500 dark:bg-blue-800 w-full shadow-sm"
    >
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <Button
            onClick={() => setOpen(true)}
            variant="ghost"
            className="w-full rounded-none cursor-pointer px-4 py-3 hover:bg-blue-600 dark:hover:bg-blue-900 text-white hover:text-white"
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
              <ChevronDown className="ms-2 h-5 w-5 cursor-pointer" />
            </motion.div>
          </Button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 50 }}
            animate={{ opacity: 1, height: 170 }}
            exit={{ opacity: 0, height: 50 }}
            transition={{ duration: 0.3 }}
            className="w-full origin-top pt-4 flex flex-col justify-between items-center bg-card"
          >
            <Suspense
              fallback={
                <div className="flex gap-2 text-accent-foreground h-full w-full items-center justify-center">
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
              className="w-full rounded-none cursor-pointer mt-2"
              onClick={() => setOpen(false)}
            >
              <ChevronUp className=" cursor-pointer text-primary" />
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
            'mx-2 min-w-[160px] bg-card text-accent-foreground py-2 px-4 rounded-xl shadow-sm border flex flex-col justify-center'
          )}
        >
          <h3
            className={cn(
              'text-sm font-semibold mb-1',
              getExpirationStatus(item.expiresIn).color
            )}
          >
            {item.name}
          </h3>
          <p className="text-sm ">Amount: {item.amount}</p>
          <p className="text-sm ">
            Location: {item.locationName} -{' '}
            {item.shelfName?.replace('Shelf ', '')}
          </p>
          <p className="text-sm ">
            Expires in:{' '}
            <span className={getExpirationStatus(item.expiresIn).color}>
              {item.expiresIn}
            </span>
          </p>
        </div>
      ))}
    </Marquee>
  )
}

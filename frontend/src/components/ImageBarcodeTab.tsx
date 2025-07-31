import Barcode from 'react-barcode'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { IItem } from './Items'

interface ImageBarcodeTabProps {
  off?: Partial<IItem['openFoodFacts']>
  image?: string
  barcode: string
}

const ImageBarcodeTab = ({ off, image, barcode }: ImageBarcodeTabProps) => {
  const hasFacts = !!off
  const hasBarcode = !!barcode
  const hasImage = !!image

  const tabs: { id: string; label: string; value?: string }[] = []

  if (hasFacts) {
    tabs.push({ id: 'barcode', label: 'Barcode' })
    tabs.push({ id: 'facts', label: 'Facts' })
    if (hasImage) {
      tabs.push({ id: 'image', label: 'Image', value: image })
    } else {
      tabs.push({
        id: 'image',
        label: 'Image',
        value: off!.selected_images!.front.display.en,
      })
    }
  } else {
    if (hasBarcode) tabs.push({ id: 'barcode', label: 'Barcode' })
    if (hasImage) tabs.push({ id: 'image', label: 'Image', value: image })
  }

  if (tabs.length === 0) return null

  if (tabs.length === 1) {
    const tab = tabs[0]
    if (tab.id === 'barcode') {
      return <BarcodeDisplay barcode={barcode} />
    } else if (tab.id === 'image') {
      return <ImageDisplay src={image!} />
    }
  }

  return (
    <Tabs defaultValue={tabs[0].id} className="w-full">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <div className="flex w-full flex-col">
            {tab.id === 'barcode' && <BarcodeDisplay barcode={barcode} />}
            {tab.id === 'image' && <ImageDisplay src={tab.value!} />}
            {tab.id === 'facts' && <OffDisplay off={off} />}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default ImageBarcodeTab

const ImageDisplay = ({ src }: { src: string }) => (
  <div className="w-full rounded-sm bg-white text-white font-mono flex items-center justify-center p-0">
    <img src={src} alt="Item" className="h-auto w-full rounded-md bg-red-400" />
  </div>
)

const BarcodeDisplay = ({ barcode }: { barcode: string }) => (
  <div className="flex w-full flex-col">
    <div className="w-full flex items-center justify-between mb-2">
      <Label>Barcode:</Label>
      <span className="text-sm font-mono">{barcode}</span>
    </div>
    <div className="w-full rounded-sm bg-white text-white font-mono flex items-center justify-center p-0">
      <Barcode value={barcode} background="white" />
    </div>
  </div>
)

const OffDisplay = ({ off }: { off: Partial<IItem['openFoodFacts']> }) => {
  console.log(off)
  return <div className="flex flex-col gap-2">off</div>
}

// const tabs = [
//   {
//     name: 'Explore',
//     value: 'explore',
//     icon: BookIcon,
//     content: (
//       <>
//         Discover{' '}
//         <span className="text-foreground font-semibold">fresh ideas</span>,
//         trending topics, and hidden gems curated just for you. Start exploring
//         and let your curiosity lead the way!
//       </>
//     ),
//   },
//   {
//     name: 'Favorites',
//     value: 'favorites',
//     icon: HeartIcon,
//     content: (
//       <>
//         All your{' '}
//         <span className="text-foreground font-semibold">favorites</span> are
//         saved here. Revisit articles, collections, and moments you love, any
//         time you want a little inspiration.
//       </>
//     ),
//   },
//   {
//     name: 'Surprise Me',
//     value: 'surprise',
//     icon: GiftIcon,
//     content: (
//       <>
//         <span className="text-foreground font-semibold">Surprise!</span>{' '}
//         Here&apos;s something unexpected—a fun fact, a quirky tip, or a daily
//         challenge. Come back for a new surprise every day!
//       </>
//     ),
//   },
// ]

// const ExpandableTabsDemo = () => {
//   const [activeTab, setActiveTab] = useState('explore')

//   return (
//     <div className="w-full max-w-md">
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
//         <TabsList className="h-auto gap-2 rounded-xl p-1">
//           {tabs.map(({ icon: Icon, name, value }) => {
//             const isActive = activeTab === value

//             return (
//               <motion.div
//                 key={value}
//                 layout
//                 className={cn(
//                   'flex h-8 items-center justify-center overflow-hidden rounded-md',
//                   isActive ? 'flex-1' : 'flex-none'
//                 )}
//                 onClick={() => setActiveTab(value)}
//                 initial={false}
//                 animate={{
//                   width: isActive ? 120 : 32,
//                 }}
//                 transition={{
//                   type: 'tween',
//                   stiffness: 400,
//                   damping: 25,
//                 }}
//               >
//                 <TabsTrigger value={value} asChild>
//                   <motion.div
//                     className="flex h-8 w-full items-center justify-center"
//                     animate={{ filter: 'blur(0px)' }}
//                     exit={{ filter: 'blur(2px)' }}
//                     transition={{ duration: 0.25, ease: 'easeOut' }}
//                   >
//                     <Icon className="aspect-square size-4 flex-shrink-0" />
//                     <AnimatePresence initial={false}>
//                       {isActive && (
//                         <motion.span
//                           className="font-medium max-sm:hidden"
//                           initial={{ opacity: 0, scaleX: 0.8 }}
//                           animate={{ opacity: 1, scaleX: 1 }}
//                           transition={{ duration: 0.25, ease: 'easeOut' }}
//                           style={{ originX: 0 }}
//                         >
//                           {name}
//                         </motion.span>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>
//                 </TabsTrigger>
//               </motion.div>
//             )
//           })}
//         </TabsList>

//         {tabs.map((tab) => (
//           <TabsContent key={tab.value} value={tab.value}>
//             <p className="text-muted-foreground text-sm">{tab.content}</p>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   )
// }

// ------------- OTHER

// const tabs = [
//   {
//     name: 'Explore',
//     value: 'explore',
//     content: (
//       <>
//         Discover{' '}
//         <span className="text-foreground font-semibold">fresh ideas</span>,
//         trending topics, and hidden gems curated just for you. Start exploring
//         and let your curiosity lead the way!
//       </>
//     ),
//   },
//   {
//     name: 'Favorites',
//     value: 'favorites',
//     content: (
//       <>
//         All your{' '}
//         <span className="text-foreground font-semibold">favorites</span> are
//         saved here. Revisit articles, collections, and moments you love, any
//         time you want a little inspiration.
//       </>
//     ),
//   },
//   {
//     name: 'Surprise Me',
//     value: 'surprise',
//     content: (
//       <>
//         <span className="text-foreground font-semibold">Surprise!</span>{' '}
//         Here&apos;s something unexpected—a fun fact, a quirky tip, or a daily
//         challenge. Come back for a new surprise every day!
//       </>
//     ),
//   },
// ]

// const AnimatedUnderlineTabsDemo = () => {
//   const [activeTab, setActiveTab] = React.useState('explore')
//   const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
//   const [underlineStyle, setUnderlineStyle] = React.useState({
//     left: 0,
//     width: 0,
//   })

//   React.useLayoutEffect(() => {
//     const activeIndex = tabs.findIndex((tab) => tab.value === activeTab)
//     const activeTabElement = tabRefs.current[activeIndex]

//     if (activeTabElement) {
//       const { offsetLeft, offsetWidth } = activeTabElement

//       setUnderlineStyle({
//         left: offsetLeft,
//         width: offsetWidth,
//       })
//     }
//   }, [activeTab])

//   return (
//     <div className="w-full max-w-md">
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
//         <TabsList className="bg-background relative rounded-none border-b p-0">
//           {tabs.map((tab, index) => (
//             <TabsTrigger
//               key={tab.value}
//               value={tab.value}
//               ref={(el) => {
//                 tabRefs.current[index] = el
//               }}
//               className="bg-background dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none"
//             >
//               {tab.name}
//             </TabsTrigger>
//           ))}

//           <motion.div
//             className="bg-primary absolute bottom-0 z-20 h-0.5"
//             layoutId="underline"
//             style={{
//               left: underlineStyle.left,
//               width: underlineStyle.width,
//             }}
//             transition={{
//               type: 'spring',
//               stiffness: 400,
//               damping: 40,
//             }}
//           />
//         </TabsList>

//         {tabs.map((tab) => (
//           <TabsContent key={tab.value} value={tab.value}>
//             <p className="text-muted-foreground text-sm">{tab.content}</p>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   )
// }

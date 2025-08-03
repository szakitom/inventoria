import Barcode from 'react-barcode'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { IItem } from './Items'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Barcode as BarcodeIcon, Image, Utensils } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Separator } from './ui/separator'
import { useTheme } from './ui/theme-provider'

type Nutriments = NonNullable<IItem['openFoodFacts']>['nutriments']

interface ImageBarcodeTabProps {
  off?: Partial<IItem['openFoodFacts']>
  image?: string
  barcode: string
}

const ImageBarcodeTab = ({ off, image, barcode }: ImageBarcodeTabProps) => {
  const hasNutrition = !!off
  const hasBarcode = !!barcode
  const hasImage = !!image

  const tabs: {
    id: string
    label: string
    image?: string
    nutrition?: Nutriments
    icon: React.ElementType
  }[] = []

  if (hasNutrition) {
    if (off.nutriments) {
      const nutriments = off.nutriments
      tabs.push({
        id: 'nutrition',
        label: 'Nutrition',
        icon: Utensils,
        nutrition: nutriments,
      })
    }

    if (hasBarcode) {
      tabs.push({ id: 'barcode', label: 'Barcode', icon: BarcodeIcon })
    }
    const imageToUse = hasImage
      ? image
      : off.selected_images?.front?.display[
          Object.keys(off.selected_images?.front?.display)[0]
        ]
    if (imageToUse) {
      tabs.push({
        id: 'image',
        label: 'Image',
        image: imageToUse,
        icon: Image,
      })
    }
  } else {
    if (hasBarcode)
      tabs.push({ id: 'barcode', label: 'Barcode', icon: BarcodeIcon })
    if (hasImage)
      tabs.push({ id: 'image', label: 'Image', image: image, icon: Image })
  }

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full gap-2 p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <motion.div
              key={tab.id}
              layout
              className={cn(
                'flex h-8 items-center justify-center overflow-hidden rounded-md',
                isActive ? 'flex-1' : 'flex-none'
              )}
              style={{ background: 'transparent' }}
              onClick={() => setActiveTab(tab.id)}
              initial={false}
              animate={{
                width: isActive ? 120 : 32,
              }}
              transition={{
                type: 'tween',
                stiffness: 400,
                damping: 25,
              }}
            >
              <TabsTrigger
                value={tab.id}
                asChild
                className="flex w-full items-center"
              >
                <motion.div
                  className="flex w-full items-center justify-center"
                  animate={{ filter: 'blur(0px)' }}
                  exit={{ filter: 'blur(2px)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <tab.icon className="aspect-square flex-shrink-0" />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scaleX: 0.8 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{ originX: 0 }}
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsTrigger>
            </motion.div>
          )
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <div className="flex w-full flex-col">
            {tab.id === 'barcode' && <BarcodeDisplay barcode={barcode} />}
            {tab.id === 'image' && <ImageDisplay src={tab.image!} />}
            {tab.id === 'nutrition' && (
              <OffDisplay nutriments={tab.nutrition!} />
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default ImageBarcodeTab

const ImageDisplay = ({ src }: { src: string }) => (
  <Card className="w-full text-black py-0 aspect-[1/1] rounded-sm flex items-center justify-center">
    <img
      src={src}
      alt="Item"
      className="w-full h-full  object-contain rounded-md"
    />
  </Card>
)

const BarcodeDisplay = ({ barcode }: { barcode: string }) => {
  const { theme } = useTheme()
  console.log(theme)
  return (
    <Card className="w-full py-0">
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="w-full flex items-center justify-between mb-2">
          <Label>Barcode:</Label>
          <span className="text-sm font-mono">{barcode}</span>
        </div>
        <div className="w-full rounded-md font-mono flex items-center justify-center p-0 overflow-hidden">
          <Barcode value={barcode} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}

const OffDisplay = ({ nutriments }: { nutriments: Nutriments }) => {
  const {
    'energy-kj_100g': energyKj,
    'energy-kcal_100g': energyKcal,
    fat_100g: fat,
    'saturated-fat_100g': saturatedFat,
    carbohydrates_100g: carbohydrates,
    sugars_100g: sugars,
    proteins_100g: proteins,
    salt_100g: salt,
  } = nutriments
  return (
    <Card className="gap-0 w-full p-4">
      <CardHeader className="p-0 pb-2 gap-0">
        <CardTitle className="text-base font-semibold leading-tight truncate">
          Átlagos tápérték
        </CardTitle>
        <CardDescription className="flex items-center space-x-1 text-sm text-muted-foreground mt-1 truncate">
          100g-ban
        </CardDescription>
      </CardHeader>
      <Separator className="mb-2" />
      <CardContent className="p-0 text-sm">
        <dl className="space-y-1">
          <div className="flex justify-between">
            <dt className="font-semibold">Energia</dt>
            <dd>
              {energyKj ?? '-'} kJ /{' '}
              <span className="font-semibold">{energyKcal ?? '-'} kcal</span>
            </dd>
          </div>

          <div className="flex justify-between">
            <dt>Zsír</dt>
            <dd>{fat ?? '-'} g</dd>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground text-xs">
            <dt>ebből telített zsírsavak</dt>
            <dd>{saturatedFat ?? '-'} g</dd>
          </div>

          <div className="flex justify-between">
            <dt>Szénhidrát</dt>
            <dd>{carbohydrates ?? '-'} g</dd>
          </div>
          <div className="flex justify-between pl-4 text-muted-foreground text-xs">
            <dt>ebből cukrok</dt>
            <dd>{sugars ?? '-'} g</dd>
          </div>

          <div className="flex justify-between">
            <dt>Fehérje</dt>
            <dd>{proteins ?? '-'} g</dd>
          </div>

          <div className="flex justify-between">
            <dt>Só</dt>
            <dd>{salt ?? '-'} g</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

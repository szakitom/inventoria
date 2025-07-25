// DialogContext.tsx
import { createContext, type ComponentType, type FC } from 'react'

export type DialogKey = string

type OpenFunction = (type: DialogKey, data?: unknown) => void

export type DialogContextType = {
  open: OpenFunction
  register: (type: DialogKey, renderer: FC<any>) => void
  current: {
    type: DialogKey | null
    data: unknown | null
  }
}

export const DialogContext = createContext<DialogContextType | undefined>(
  undefined
)

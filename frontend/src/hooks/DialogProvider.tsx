import { useState, useCallback, useRef, type ReactNode, type FC } from 'react'
import {
  DialogContext,
  type DialogContextType,
  type DialogKey,
} from '@/hooks/DialogContext'

type DialogProps = Record<string, unknown>

interface BaseDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: (params?: unknown) => void
  [key: string]: unknown
}

type OpenDialog = {
  type: DialogKey
  props: DialogProps
}

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [openDialogs, setOpenDialogs] = useState<OpenDialog[]>([])

  const dialogMap = useRef(new Map<DialogKey, FC<BaseDialogProps>>())

  const register = useCallback(
    (type: DialogKey, component: FC<{ data?: unknown }>) => {
      dialogMap.current.set(type, component as FC<BaseDialogProps>)
    },
    []
  )

  const open = useCallback((type: DialogKey, data?: unknown) => {
    setOpenDialogs((prev) => [
      ...prev,
      { type, props: (data as DialogProps) || {} },
    ])
  }, [])

  const close = useCallback((type?: DialogKey) => {
    setOpenDialogs((prev) => {
      if (!type) {
        // close the top dialog
        return prev.slice(0, -1)
      }
      // close specific dialog
      return prev.filter((d) => d.type !== type)
    })
  }, [])

  const value: DialogContextType = {
    open,
    register,
    current: openDialogs.length
      ? {
          type: openDialogs[openDialogs.length - 1].type,
          data: openDialogs[openDialogs.length - 1].props,
        }
      : { type: null, data: {} },
  }

  return (
    <DialogContext.Provider value={value}>
      {children}

      {openDialogs.map(({ type, props }) => {
        const Component = dialogMap.current.get(type)!
        return (
          <Component
            key={type + openDialogs.indexOf({ type, props })} // ensure unique key for stacking
            {...props}
            isOpen={true}
            onCancel={() => {
              if (typeof props?.onCancel === 'function') props.onCancel()
              close(type)
            }}
            onSubmit={async (...params) => {
              if (typeof props?.onSubmit === 'function')
                await props.onSubmit(...params)
              close(type)
            }}
          />
        )
      })}
    </DialogContext.Provider>
  )
}

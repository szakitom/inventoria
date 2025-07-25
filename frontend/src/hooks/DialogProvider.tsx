// DialogContext.tsx
import { useState, useCallback, useRef, type ReactNode, type FC } from 'react'
import {
  DialogContext,
  type DialogContextType,
  type DialogKey,
} from './Dialogcontext'

type DialogProps = Record<string, unknown>

interface BaseDialogProps {
  isOpen: boolean
  onCancel: () => void
  onSubmit: () => void
  [key: string]: unknown
}

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogType, setDialogType] = useState<DialogKey | null>(null)
  const [props, setProps] = useState<DialogProps | null>(null)

  const dialogMap = useRef(new Map<DialogKey, FC<BaseDialogProps>>())

  const register = useCallback(
    (type: DialogKey, component: FC<{ data?: unknown }>) => {
      dialogMap.current.set(type, component as FC<BaseDialogProps>)
    },
    []
  )

  const open = useCallback((type: DialogKey, data?: unknown) => {
    setDialogType(type)
    setProps((data as DialogProps) || null)
  }, [])

  const close = useCallback(() => {
    setDialogType(null)
    setProps(null)
  }, [])

  const value: DialogContextType = {
    open,
    register,
    current: { type: dialogType, data: props },
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
      {/* Render the current dialog if registered */}
      {dialogType &&
        dialogMap.current.has(dialogType) &&
        (() => {
          const Component = dialogMap.current.get(dialogType)!
          return (
            <Component
              {...props}
              isOpen={true}
              onCancel={() => {
                if (typeof props?.onCancel === 'function') {
                  props.onCancel()
                }
                close()
              }}
              onSubmit={() => {
                if (typeof props?.onSubmit === 'function') {
                  props.onSubmit()
                }
                close()
              }}
            />
          )
        })()}
    </DialogContext.Provider>
  )
}

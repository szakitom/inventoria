// DialogContext.tsx
import {
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type ComponentType,
  type FC,
} from 'react'
import {
  DialogContext,
  type DialogContextType,
  type DialogKey,
} from './Dialogcontext'

type DialogProps = Record<string, unknown>

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogType, setDialogType] = useState<DialogKey | null>(null)
  const [props, setProps] = useState<DialogProps | null>(null)

  const dialogMap = useRef(new Map<DialogKey, FC<any>>())

  const register = useCallback((type: DialogKey, component: FC<any>) => {
    dialogMap.current.set(type, component)
  }, [])

  const open = useCallback((type: DialogKey, dialogProps?: DialogProps) => {
    setDialogType(type)
    setProps(dialogProps || null)
  }, [])

  const close = useCallback(() => {
    setDialogType(null)
    setProps(null)
  }, [])

  const value: DialogContextType = {
    open,
    register,
    current: { type: dialogType, props },
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

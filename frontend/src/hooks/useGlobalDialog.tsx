import { useContext } from 'react'
import { DialogContext } from './Dialogcontext'

export const useGlobalDialog = () => {
  const ctx = useContext(DialogContext)
  if (!ctx) {
    throw new Error('useGlobalDialog must be used within <DialogProvider>')
  }
  return ctx
}

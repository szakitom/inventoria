import { useEffect } from 'react'
import { useGlobalDialog } from './useGlobalDialog'

export const useDialog = <TProps = any,>(
  Component: React.FC<TProps>,
  key: string
) => {
  const { register } = useGlobalDialog()

  useEffect(() => {
    register(key, Component)
  }, [key, Component, register])

  return {}
}

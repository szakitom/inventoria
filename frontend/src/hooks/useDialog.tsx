import { useEffect } from 'react'
import { useGlobalDialog } from './useGlobalDialog'

export const useDialog = <
  TProps extends { data?: unknown } = { data?: unknown },
>(
  Component: React.FC<TProps>,
  key: string
) => {
  const { register } = useGlobalDialog()

  useEffect(() => {
    register(key, Component as React.FC<{ data?: unknown }>)
  }, [key, Component, register])

  return {}
}

import { createRootRoute, Outlet } from '@tanstack/react-router'
import Header from '@/components/Header'

// TODO: add error boundary with the ability to toast

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
})

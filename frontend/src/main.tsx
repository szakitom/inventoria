import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'

import './index.css'

// Import the generated route tree
import { routeTree } from '@/routeTree.gen'
import { ThemeProvider } from '@/components/ui/theme-provider'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <TanStackRouterDevtools router={router} />
        <Toaster richColors />
      </ThemeProvider>
    </StrictMode>
  )
}

import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

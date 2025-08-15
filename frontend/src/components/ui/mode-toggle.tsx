import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme, type Theme } from '@/components/ui/theme-provider'
import { useState } from 'react'

const switchTheme = (theme: Theme) => {
  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    root.classList.add(prefersDark ? 'dark' : 'light')
    localStorage.removeItem('vite-ui-theme')
  } else {
    root.classList.add(theme)
    localStorage.setItem('vite-ui-theme', theme)
  }
}

export function ModeToggle() {
  const { theme: currentTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const handleTheme = (theme: Theme) => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'

    // Effective current theme (resolve 'system' to actual)
    const effectiveCurrentTheme =
      currentTheme === 'system' ? systemTheme : currentTheme

    // If new theme equals current effective theme, no need to switch
    const shouldSwitch =
      (theme !== effectiveCurrentTheme && theme !== 'system') ||
      (theme === 'system' && effectiveCurrentTheme !== systemTheme)

    if (!document.startViewTransition) {
      switchTheme(theme)
    }

    if (shouldSwitch) {
      document.startViewTransition(() => {
        switchTheme(theme)
      })
      setTimeout(() => {
        setTheme(theme)
      }, 100)
    } else {
      setTheme(theme)
    }
    setTimeout(() => {
      setOpen(false)
    }, 100)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleTheme('light')
          }}
          disabled={currentTheme === 'light'}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleTheme('dark')
          }}
          disabled={currentTheme === 'dark'}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleTheme('system')
          }}
          disabled={currentTheme === 'system'}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

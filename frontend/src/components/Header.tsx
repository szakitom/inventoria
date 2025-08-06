'use client'

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ui/mode-toggle'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

const Header = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-40 bg-background border-b shadow-sm">
        <header className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
            onClick={() => setOpen(false)}
          >
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-6 h-6 dark:bg-foreground rounded-full"
            />
            <span className="font-semibold text-lg tracking-tight">
              {import.meta.env.VITE_APP_TITLE}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/locations"
                      activeProps={{
                        className:
                          'font-semibold text-primary ring-1 ring-muted-foreground/20 underline underline-offset-4',
                      }}
                      className="transition-colors px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-muted min-w-24 text-center"
                    >
                      Locations
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="ml-auto flex items-center gap-2">
              <ModeToggle />

              <Button asChild variant="default">
                <Link to="/add">+ Add Item</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              className="group size-8"
              variant="ghost"
              size="icon"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <svg
                className="pointer-events-none"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M4 12L20 12"
                  className="origin-center -translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                />
                <path
                  d="M4 12H20"
                  className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                />
                <path
                  d="M4 12H20"
                  className="origin-center translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                />
              </svg>
            </Button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full z-50 shadow-md border-b bg-background px-4 pb-4 pt-3 md:hidden"
            >
              <nav className="flex flex-col gap-3">
                <Link
                  to="/locations"
                  activeProps={{
                    className:
                      'font-semibold text-primary ring-1 ring-muted-foreground/20 underline underline-offset-4',
                  }}
                  className="transition-colors px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-muted min-w-24"
                  onClick={() => setOpen(false)}
                >
                  Locations
                </Link>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    asChild
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/add">+ Add Item</Link>
                  </Button>
                  <ModeToggle />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-white/40 dark:bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default Header

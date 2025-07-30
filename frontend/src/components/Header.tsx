'use client'

import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState } from 'react'

// TODO: fix

const Header = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="sticky top-0 z-40 bg-white"
        style={{ '--header-height': '60px' } as React.CSSProperties}
      >
        <header className="px-4 py-3 flex items-center justify-between border-b shadow-sm">
          <Link
            to="/"
            className="flex items-center gap-2 text-foreground hover:opacity-80 transition"
          >
            <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight">
              {import.meta.env.VITE_APP_TITLE}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/locations"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Locations
            </Link>
            <Button asChild>
              <Link to="/add">+ Add Item</Link>
            </Button>
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle menu">
                  {open ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent className="absolute top-full left-0 w-full z-50 bg-white shadow-md border-b px-4 pb-4 pt-2 animate-slide-down md:hidden">
            <nav className="flex flex-col gap-3">
              <Link
                to="/locations"
                className="text-sm text-muted-foreground hover:text-foreground transition"
                onClick={() => setOpen(false)}
              >
                Locations
              </Link>
              <Button asChild className="w-full" onClick={() => setOpen(false)}>
                <Link to="/items/add">+ Add Item</Link>
              </Button>
            </nav>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-200 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}

export default Header

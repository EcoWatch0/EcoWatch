"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useNavigationMode } from "@/components/navigation/nav-links"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { routes, switchHref, switchLabel, switchIcon: SwitchIcon } = useNavigationMode()
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 mt-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent ${
                pathname === route.href 
                  ? "bg-accent font-medium"
                  : "transparent"
              }`}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
          
          <Link
            href={switchHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent mt-2 border-t pt-4"
          >
            <SwitchIcon className="h-5 w-5" />
            {switchLabel}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
} 
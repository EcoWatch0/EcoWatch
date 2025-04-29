"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { 
  BarChart, 
  Home, 
  Leaf, 
  Settings, 
  Shield 
} from "lucide-react"

const mainRoutes = [
  {
    href: "/",
    label: "Accueil",
    icon: Home
  },
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: BarChart
  },
  {
    href: "/application",
    label: "Application",
    icon: Leaf
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings
  }
]

interface MobileNavProps {
  includeAdminLink?: boolean
}

export function MobileNav({ includeAdminLink = true }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

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
          {mainRoutes.map((route) => (
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
          
          {includeAdminLink && (
            <Link
              href={isAdmin ? "/" : "/admin"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent mt-2 border-t pt-4"
            >
              <Shield className="h-5 w-5" />
              {isAdmin ? "Application" : "Admin"}
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
} 
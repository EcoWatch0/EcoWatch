"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard,
  Leaf,
  Menu,
  Settings,
  Shield,
  Users
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const adminRoutes = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: Users
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    icon: Settings
  }
]

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {adminRoutes.map((route) => (
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
              <div className="border-t my-2"></div>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              >
                <Leaf className="h-5 w-5" />
                Application
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-4">
          <Shield className="h-6 w-6 text-green-600" />
          <span className="font-bold text-xl hidden md:inline-flex">EcoWatch Admin</span>
          <span className="font-bold text-xl md:hidden">Admin</span>
        </div>
        <div className="flex items-center ml-auto gap-4">
          <ModeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Leaf className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline-flex">Application</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-[240px] flex-col border-r bg-background">
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-2">
              {adminRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${
                    pathname === route.href
                      ? "bg-accent" 
                      : "transparent"
                  }`}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
              <div className="border-t my-2 mx-3"></div>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Leaf className="h-5 w-5" />
                Application
              </Link>
            </nav>
          </ScrollArea>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 
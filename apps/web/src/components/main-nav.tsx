"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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

interface MainNavProps {
  includeAdminLink?: boolean
  className?: string
}

export function MainNav({ includeAdminLink = true, className }: MainNavProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {mainRoutes.map((route) => (
        <Link 
          key={route.href}
          href={route.href}
          className={`text-sm transition-colors hover:text-primary flex items-center gap-1.5 ${
            pathname === route.href 
              ? "text-foreground font-medium" 
              : "text-muted-foreground"
          }`}
        >
          <route.icon className="h-4 w-4" />
          <span>{route.label}</span>
        </Link>
      ))}
      
      {includeAdminLink && (
        <Link 
          href={isAdmin ? "/" : "/admin"}
          className="text-sm transition-colors hover:text-primary flex items-center gap-1.5 text-muted-foreground ml-2"
        >
          <Shield className="h-4 w-4" />
          <span>{isAdmin ? "Application" : "Admin"}</span>
        </Link>
      )}
    </nav>
  )
} 
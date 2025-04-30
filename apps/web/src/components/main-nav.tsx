"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useNavigationMode } from "@/components/navigation/nav-links"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  const { routes, switchHref, switchLabel, switchIcon: SwitchIcon } = useNavigationMode()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
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
      
      <Link 
        href={switchHref}
        className="text-sm transition-colors hover:text-primary flex items-center gap-1.5 text-muted-foreground ml-2"
      >
        <SwitchIcon className="h-4 w-4" />
        <span>{switchLabel}</span>
      </Link>
    </nav>
  )
} 
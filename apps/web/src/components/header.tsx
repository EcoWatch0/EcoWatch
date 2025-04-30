"use client"

import * as React from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useNavigationMode } from "@/components/navigation/nav-links"
import { LogoutButton } from "@/components/auth/logout-button"

export function Header() {
  const { title, switchIcon: SwitchIcon } = useNavigationMode()
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  
  // Vérifier si l'utilisateur est connecté côté client
  React.useEffect(() => {
    const hasToken = document.cookie.includes('token=')
    setIsAuthenticated(hasToken)
  }, [])

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <MobileNav />
        
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <SwitchIcon className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl">{title}</span>
          </Link>
        </div>
        
        <div className="flex md:hidden ml-2">
          <Link href="/" className="flex items-center gap-2">
            <SwitchIcon className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl">{title}</span>
          </Link>
        </div>
        
        <div className="hidden mx-6 md:flex items-center flex-1">
          <MainNav />
        </div>
        
        <div className="flex items-center ml-auto gap-2">
          <ModeToggle />
          {isAuthenticated && <LogoutButton />}
        </div>
      </div>
    </header>
  )
} 
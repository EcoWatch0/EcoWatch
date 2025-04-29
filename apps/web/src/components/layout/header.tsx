"use client"

import * as React from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Leaf } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <MobileNav />
        
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl">EcoWatch</span>
          </Link>
        </div>
        
        <div className="flex md:hidden ml-2">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl">EcoWatch</span>
          </Link>
        </div>
        
        <div className="hidden mx-6 md:flex items-center flex-1">
          <MainNav />
        </div>
        
        <div className="flex items-center ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
} 
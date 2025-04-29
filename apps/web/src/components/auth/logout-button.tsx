"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showIcon?: boolean
  label?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LogoutButton({ 
  showIcon = true, 
  label = "Déconnexion", 
  variant = "ghost",
  className,
  ...props 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isLoading ? "Déconnexion..." : label}
    </Button>
  )
} 
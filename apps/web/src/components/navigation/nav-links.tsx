"use client"

import { usePathname } from "next/navigation"
import { BarChart, Home, Leaf, Shield, Settings, LayoutDashboard, Users } from "lucide-react"

// Routes principales de l'application
export const mainRoutes = [
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

// Routes pour la section admin
export const adminRoutes = [
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

// Fonction pour déterminer le mode actuel (admin ou application)
export function useNavigationMode() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  
  return {
    isAdmin,
    routes: isAdmin ? adminRoutes : mainRoutes,
    switchLabel: isAdmin ? "Application" : "Admin",
    switchIcon: isAdmin ? Leaf : Shield,
    switchHref: isAdmin ? "/" : "/admin",
    title: isAdmin ? "EcoWatch Admin" : "EcoWatch"
  }
} 
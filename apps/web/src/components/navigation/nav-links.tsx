"use client"

import { usePathname } from "next/navigation"
import { BarChart, Home, Leaf, Shield, Users, Building } from "lucide-react"

type RouteItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const MAIN_ROUTES: readonly RouteItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/dashboard", label: "Tableau de bord", icon: BarChart },
] as const

const ADMIN_ROUTES: readonly RouteItem[] = [
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/organizations", label: "Organisations", icon: Building },
] as const

export type NavigationSection = "main" | "admin"

function computeSection(pathname: string): NavigationSection {
  return pathname.startsWith("/admin") ? "admin" : "main"
}

export function useNavigationMode() {
  const pathname = usePathname()
  const section = computeSection(pathname)
  const isAdmin = section === "admin"
  const routes = (isAdmin ? ADMIN_ROUTES : MAIN_ROUTES).map((r) => ({
    ...r,
    // Active if exact or under the subtree
    active: pathname === r.href || pathname.startsWith(`${r.href}/`),
  }))

  return {
    isAdmin,
    routes,
    switchLabel: isAdmin ? "Application" : "Admin",
    switchIcon: isAdmin ? Leaf : Shield,
    switchHref: isAdmin ? "/" : "/admin",
    title: isAdmin ? "EcoWatch Admin" : "EcoWatch",
  }
}
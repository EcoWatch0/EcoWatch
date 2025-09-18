"use client"

import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
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

function useHasAdminAccess(): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  if (user.role === "ADMIN") return true
  return (user.orgMemberships ?? []).some((m) => m.role === "MANAGER")
}

export function useNavigationMode() {
  const pathname = usePathname()
  const canAdmin = useHasAdminAccess()
  const section = computeSection(pathname)
  const isAdmin = section === "admin" && canAdmin
  const routes = (isAdmin ? ADMIN_ROUTES : MAIN_ROUTES).map((r) => ({
    ...r,
    // Active if exact or under the subtree
    active: pathname === r.href || pathname.startsWith(`${r.href}/`),
  }))

  return {
    isAdmin,
    routes,
    switchLabel: isAdmin ? "Application" : (canAdmin ? "Admin" : ""),
    switchIcon: isAdmin ? Leaf : Shield,
    switchHref: isAdmin ? "/" : (canAdmin ? "/admin" : "/"),
    title: isAdmin ? "EcoWatch Admin" : "EcoWatch",
  }
}
"use client"

import { create } from "zustand"
import type { AuthUser } from "@/lib/api/auth"
import { getCookie } from "cookies-next"

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: AuthUser | null
  setToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
  clear: () => void
  hydrateFromCookie: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),
  setUser: (user) => set({ user }),
  clear: () => set({ token: null, isAuthenticated: false, user: null }),
  hydrateFromCookie: () => {
    const token = getCookie("token") as string | undefined
    set({ token: token ?? null, isAuthenticated: Boolean(token) })
  },
}))


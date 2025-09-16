"use client"

import { useEffect, useCallback } from "react"
import { useAuthStore } from "@/store/auth-store"
import * as AuthApi from "@/lib/api/auth"

export function useAuth() {
  const { token, user, isAuthenticated, setToken, setUser, clear, hydrateFromCookie } = useAuthStore()

  useEffect(() => {
    hydrateFromCookie()
  }, [hydrateFromCookie])

  const login = useCallback(async (email: string, password: string) => {
    const result = await AuthApi.login({ email, password })
    setToken(result.token)
    setUser(result.user)
    return result
  }, [setToken, setUser])

  const logout = useCallback(() => {
    AuthApi.logout()
    clear()
  }, [clear])

  return { token, user, isAuthenticated, login, logout }
}


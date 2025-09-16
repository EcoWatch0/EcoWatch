import { fetchJson } from "@/lib/api/client"
import { setCookie, deleteCookie, getCookie } from "cookies-next"

export type Role = "ADMIN" | "OPERATOR" | "USER"

export interface AuthTokens {
  access_token: string
}

export interface AuthUser {
  id: string
  email: string
  role: Role
  name?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  user: AuthUser | null
}

function persistToken(token: string): void {
  setCookie("token", token, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const tokens = await fetchJson<AuthTokens>("/auth/login", {
    method: "POST",
    body: input,
    withAuth: false,
  })

  const token = tokens.access_token
  persistToken(token)

  // Try to derive user from JWT payload if present
  const user = decodeJwtUser(token)

  return { token, user }
}

export function logout(): void {
  deleteCookie("token")
}

export function getToken(): string | null {
  const token = getCookie("token") as string | undefined
  return token ?? null
}

export function decodeJwtUser(token: string): AuthUser | null {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    // Pad base64 string to proper length
    const padded = base64 + "===".slice((base64.length + 3) % 4)
    const jsonStr = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("utf-8")
    const json = JSON.parse(jsonStr) as Record<string, unknown>
    const id = typeof json["sub"] === "string" ? json["sub"] : undefined
    const email = typeof json["email"] === "string" ? json["email"] : undefined
    const role = typeof json["role"] === "string" ? (json["role"] as Role) : undefined
    if (!id || !email || !role) return null
    const name = typeof json["name"] === "string" ? json["name"] : undefined
    return { id, email, role, name }
  } catch {
    return null
  }
}


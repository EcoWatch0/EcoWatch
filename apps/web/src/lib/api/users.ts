import { fetchJson } from "@/lib/api/client"
import type { Role } from "@/lib/api/auth"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserInput {
  email: string
  name: string
  role: Role
  password: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
  role?: Role
  password?: string
}

export async function listUsers(): Promise<User[]> {
  return fetchJson<User[]>("/users")
}

export async function getUser(userId: string): Promise<User> {
  return fetchJson<User>(`/users/${userId}`)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return fetchJson<User>("/users", { method: "POST", body: input })
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
  return fetchJson<User>(`/users/${userId}`, { method: "PATCH", body: input })
}

export async function deleteUser(userId: string): Promise<{ success: boolean } | void> {
  return fetchJson<{ success: boolean } | void>(`/users/${userId}`, { method: "DELETE" })
}


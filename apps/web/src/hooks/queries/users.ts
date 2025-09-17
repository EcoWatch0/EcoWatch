"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as UsersApi from "@/lib/api/users"

export const usersKeys = {
  all: ["users"] as const,
  detail: (id: string) => [...usersKeys.all, id] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: usersKeys.all,
    queryFn: () => UsersApi.listUsers(),
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => UsersApi.getUser(userId),
    enabled: Boolean(userId),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UsersApi.CreateUserInput) => UsersApi.createUser(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}

export function useUpdateUser(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UsersApi.UpdateUserInput) => UsersApi.updateUser(userId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all })
      qc.invalidateQueries({ queryKey: usersKeys.detail(userId) })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => UsersApi.deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all })
    },
  })
}


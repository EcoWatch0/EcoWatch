"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as OrgsApi from "@/lib/api/organizations"

export const orgsKeys = {
  all: ["organizations"] as const,
  detail: (id: string) => [...orgsKeys.all, id] as const,
  members: (id: string) => [...orgsKeys.detail(id), "members"] as const,
}

export function useOrganizations() {
  return useQuery({
    queryKey: orgsKeys.all,
    queryFn: () => OrgsApi.listOrganizations(),
  })
}

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: orgsKeys.detail(organizationId),
    queryFn: () => OrgsApi.getOrganization(organizationId),
    enabled: Boolean(organizationId),
  })
}

export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: orgsKeys.members(organizationId),
    queryFn: () => OrgsApi.getOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: OrgsApi.CreateOrganizationInput) => OrgsApi.createOrganization(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgsKeys.all })
    },
  })
}

export function useUpdateOrganization(organizationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: OrgsApi.UpdateOrganizationInput) => OrgsApi.updateOrganization(organizationId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgsKeys.all })
      qc.invalidateQueries({ queryKey: orgsKeys.detail(organizationId) })
    },
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (organizationId: string) => OrgsApi.deleteOrganization(organizationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgsKeys.all })
    },
  })
}


import { fetchJson } from "@/lib/api/client"

export interface Organization {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrganizationMember {
  id: string
  email: string
  name: string
  role: string
}

export interface CreateOrganizationInput {
  name: string
  description?: string
}

export interface UpdateOrganizationInput {
  name?: string
  description?: string
}

export async function listOrganizations(): Promise<Organization[]> {
  return fetchJson<Organization[]>("/organizations")
}

export async function getOrganization(organizationId: string): Promise<Organization> {
  return fetchJson<Organization>(`/organizations/${organizationId}`)
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  return fetchJson<OrganizationMember[]>(`/organizations/${organizationId}/members`)
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  return fetchJson<Organization>("/organizations", { method: "POST", body: input })
}

export async function updateOrganization(organizationId: string, input: UpdateOrganizationInput): Promise<Organization> {
  return fetchJson<Organization>(`/organizations/${organizationId}`, { method: "PATCH", body: input })
}

export async function deleteOrganization(organizationId: string): Promise<{ success: boolean } | void> {
  return fetchJson<{ success: boolean } | void>(`/organizations/${organizationId}`, { method: "DELETE" })
}


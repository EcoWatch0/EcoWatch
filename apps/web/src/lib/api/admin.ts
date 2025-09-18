import { fetchJson } from "@/lib/api/client"
import type { Role, OrgRole } from "@/lib/api/auth"

export type AdminUserListItem = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  // When filtered by org: current org role
  orgRole?: OrgRole | null
  // When global
  organizations?: { organizationId: string; role: OrgRole }[]
}

export async function listUsers(orgId?: string): Promise<AdminUserListItem[]> {
  const qs = orgId ? `?orgId=${encodeURIComponent(orgId)}` : ""
  return fetchJson<AdminUserListItem[]>(`/admin/users${qs}`)
}

export async function listOrgUsers(orgId: string): Promise<AdminUserListItem[]> {
  return fetchJson<AdminUserListItem[]>(`/admin/orgs/${orgId}/users`)
}

export async function addUserToOrg(params: { orgId: string; email: string; orgRole: Extract<OrgRole, "STAFF" | "MANAGER">; makePlatformAdmin?: boolean }): Promise<{ success: boolean }> {
  const { orgId, ...body } = params
  return fetchJson<{ success: boolean }>(`/admin/orgs/${orgId}/users`, { method: "POST", body })
}

export async function updateOrgUser(params: { orgId: string; userId: string; orgRole?: Extract<OrgRole, "STAFF" | "MANAGER">; makePlatformAdmin?: boolean }): Promise<{ success: boolean }> {
  const { orgId, userId, ...body } = params
  return fetchJson<{ success: boolean }>(`/admin/orgs/${orgId}/users/${userId}`, { method: "PATCH", body })
}


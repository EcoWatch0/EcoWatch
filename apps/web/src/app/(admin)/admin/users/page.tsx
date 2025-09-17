"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, UserPlus } from "lucide-react"
import { useUsers, useCreateUser, useDeleteUser, useAdminUsers } from "@/hooks/queries/users"
import type { User } from "@/lib/api/users"
import { UserForm } from "@/components/admin/users/user-form"
import { toast } from "sonner"
import { OrganizationSelector } from "@/app/(main)/dashboard/components/organization-selector"
import * as AdminApi from "@/lib/api/admin"
import { useAuthStore } from "@/store/auth-store"

export default function UsersPage() {
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(null)
  const { data, isLoading, isError } = useAdminUsers(selectedOrg?.id)
  const createMutation = useCreateUser()
  const deleteMutation = useDeleteUser()
  const [query, setQuery] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openAddToOrg, setOpenAddToOrg] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const isPlatformAdmin = currentUser?.role === "ADMIN"

  const filtered: User[] = useMemo(() => {
    const list = data ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((u) => u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [data, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
            </DialogHeader>
            <UserForm
              mode="create"
              onSubmit={async (values) => {
                try {
                  await createMutation.mutateAsync(values as never)
                  toast.success("Utilisateur créé")
                  setOpenCreate(false)
                } catch (e) {
                  const message = e instanceof Error ? e.message : "Erreur lors de la création"
                  toast.error(message)
                }
              }}
            />
          </DialogContent>
        </Dialog>

        <div className="w-full sm:w-64">
          <OrganizationSelector value={selectedOrg?.id} onChange={(org) => setSelectedOrg(org ? { id: org.id, name: org.name } : null)} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres et recherche</CardTitle>
          <CardDescription>Affinez la liste des utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher un utilisateur..." className="w-full pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            {selectedOrg ? `Utilisateurs de l'organisation` : `Tous les utilisateurs`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : isError ? (
            <div className="text-sm text-destructive">Erreur lors du chargement</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun utilisateur trouvé</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{selectedOrg ? (user.orgRole ?? "-") : user.role}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {/* Edit action could open a dialog with UserForm in edit mode */}
                          {/* <DropdownMenuItem>Modifier</DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={async () => {
                            try {
                              await deleteMutation.mutateAsync(user.id)
                              toast.success("Utilisateur supprimé")
                            } catch (e) {
                              const message = e instanceof Error ? e.message : "Erreur lors de la suppression"
                              toast.error(message)
                            }
                          }}>Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} utilisateurs</p>
          {selectedOrg && (
            <Dialog open={openAddToOrg} onOpenChange={setOpenAddToOrg}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Ajouter à l'organisation</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un utilisateur à l'organisation</DialogTitle>
                </DialogHeader>
                <UserForm
                  mode="create"
                  defaultValues={{ email: "", orgRole: "STAFF", ...(isPlatformAdmin ? { makePlatformAdmin: false } : {}) } as never}
                  onSubmit={async (values) => {
                    try {
                      const v = values as any
                      await AdminApi.addUserToOrg({ orgId: selectedOrg.id, email: v.email, orgRole: v.orgRole, ...(isPlatformAdmin ? { makePlatformAdmin: Boolean(v.makePlatformAdmin) } : {}) })
                      toast.success("Utilisateur ajouté à l'organisation")
                      setOpenAddToOrg(false)
                    } catch (e) {
                      const message = e instanceof Error ? e.message : "Erreur lors de l'ajout"
                      toast.error(message)
                    }
                  }}
                  submitLabel="Ajouter"
                />
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
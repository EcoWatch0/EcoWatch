"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Plus } from "lucide-react"
import { useOrganizations, useCreateOrganization, useDeleteOrganization, useOrganizationMembers } from "@/hooks/queries/organizations"
import type { Organization } from "@/lib/api/organizations"
import { OrganizationForm } from "@/components/admin/organizations/org-form"
import { toast } from "sonner"

export default function OrganizationsPage() {
  const { data, isLoading, isError } = useOrganizations()
  const createMutation = useCreateOrganization()
  const deleteMutation = useDeleteOrganization()
  const [query, setQuery] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const membersQuery = useOrganizationMembers(selectedId ?? "")

  const filtered: Organization[] = useMemo(() => {
    const list = data ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((o) => o.name.toLowerCase().includes(q))
  }, [data, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organisations</h2>
          <p className="text-muted-foreground">Gérez les organisations et leurs membres</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une organisation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une organisation</DialogTitle>
            </DialogHeader>
            <OrganizationForm
              mode="create"
              onSubmit={async (values) => {
                try {
                  await createMutation.mutateAsync(values as never)
                  toast.success("Organisation créée")
                  setOpenCreate(false)
                } catch (e) {
                  const message = e instanceof Error ? e.message : "Erreur lors de la création"
                  toast.error(message)
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recherche</CardTitle>
          <CardDescription>Affinez la liste des organisations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher une organisation..." className="w-full pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des organisations</CardTitle>
          <CardDescription>Toutes les organisations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : isError ? (
            <div className="text-sm text-destructive">Erreur lors du chargement</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucune organisation trouvée</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.description}</TableCell>
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
                          <DropdownMenuItem onClick={() => setSelectedId(org.id)}>Voir les membres</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={async () => {
                            try {
                              await deleteMutation.mutateAsync(org.id)
                              toast.success("Organisation supprimée")
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
      </Card>

      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>Membres</CardTitle>
            <CardDescription>Membres de l'organisation sélectionnée</CardDescription>
          </CardHeader>
          <CardContent>
            {membersQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Chargement...</div>
            ) : membersQuery.isError ? (
              <div className="text-sm text-destructive">Erreur lors du chargement</div>
            ) : (membersQuery.data?.length ?? 0) === 0 ? (
              <div className="text-sm text-muted-foreground">Aucun membre</div>
            ) : (
              <ul className="space-y-2">
                {membersQuery.data?.map((m) => (
                  <li key={m.id} className="text-sm">
                    {m.name ?? m.email} — {m.role}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


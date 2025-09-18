"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type UserCreateSchema, userCreateSchema, type UserUpdateSchema, userUpdateSchema } from "@/lib/validation/users"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrgRole } from "@/lib/api/auth"
import { Checkbox } from "@/components/ui/checkbox"

type Mode = "create" | "edit"

type AddToOrgValues = {
  email: string
  orgRole: Extract<OrgRole, "STAFF" | "MANAGER">
  makePlatformAdmin?: boolean
}

export type UserFormValuesCreate = UserCreateSchema
export type UserFormValuesUpdate = UserUpdateSchema

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  mode: Mode
  defaultValues?: Partial<UserFormValuesCreate & UserFormValuesUpdate & AddToOrgValues>
  onSubmit: (values: UserFormValuesCreate | UserFormValuesUpdate | AddToOrgValues) => Promise<void> | void
  submitLabel?: string
}) {
  const schema = mode === "create" ? userCreateSchema : userUpdateSchema
  const form = useForm<UserFormValuesCreate | UserFormValuesUpdate | AddToOrgValues>({
    resolver: zodResolver(schema as never),
    defaultValues: defaultValues as never,
    mode: "onSubmit",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (vals: UserFormValuesCreate | UserFormValuesUpdate | AddToOrgValues) => { await onSubmit(vals) })} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input placeholder="Nom complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "create" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Optional org role selector (used in Add-to-Organization modal) */}
        {("orgRole" in (defaultValues ?? {})) && (
          <FormField
            control={form.control}
            name={"orgRole" as never}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle dans l&apos;organisation</FormLabel>
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STAFF">STAFF</SelectItem>
                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Optional platform admin toggle (only shown for platform admins) */}
        {("makePlatformAdmin" in (defaultValues ?? {})) && (
          <FormField
            control={form.control}
            name={"makePlatformAdmin" as never}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Checkbox id="make-admin" checked={Boolean(field.value)} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                  <FormLabel htmlFor="make-admin">Accorder le rôle ADMIN plateforme</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enregistrement..." : (submitLabel ?? (mode === "create" ? "Créer" : "Enregistrer"))}
          </Button>
        </div>
      </form>
    </Form>
  )
}


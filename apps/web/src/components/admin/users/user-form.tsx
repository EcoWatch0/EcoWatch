"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type UserCreateSchema, userCreateSchema, type UserUpdateSchema, userUpdateSchema } from "@/lib/validation/users"

type Mode = "create" | "edit"

export interface UserFormValuesCreate extends UserCreateSchema {}
export interface UserFormValuesUpdate extends UserUpdateSchema {}

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  mode: Mode
  defaultValues?: Partial<UserFormValuesCreate & UserFormValuesUpdate>
  onSubmit: (values: UserFormValuesCreate | UserFormValuesUpdate) => Promise<void> | void
  submitLabel?: string
}) {
  const schema = mode === "create" ? userCreateSchema : userUpdateSchema
  const form = useForm<UserFormValuesCreate | UserFormValuesUpdate>({
    resolver: zodResolver(schema as never),
    defaultValues: defaultValues as never,
    mode: "onSubmit",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (vals) => { await onSubmit(vals) })} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <FormControl>
                <Input placeholder="ADMIN | OPERATOR | USER" {...field} />
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

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enregistrement..." : (submitLabel ?? (mode === "create" ? "Créer" : "Enregistrer"))}
          </Button>
        </div>
      </form>
    </Form>
  )
}


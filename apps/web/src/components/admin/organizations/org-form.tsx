"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type OrganizationCreateSchema, organizationCreateSchema, type OrganizationUpdateSchema, organizationUpdateSchema } from "@/lib/validation/organizations"

type Mode = "create" | "edit"

export interface OrgFormValuesCreate extends OrganizationCreateSchema {}
export interface OrgFormValuesUpdate extends OrganizationUpdateSchema {}

export function OrganizationForm({
  mode,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  mode: Mode
  defaultValues?: Partial<OrgFormValuesCreate & OrgFormValuesUpdate>
  onSubmit: (values: OrgFormValuesCreate | OrgFormValuesUpdate) => Promise<void> | void
  submitLabel?: string
}) {
  const schema = mode === "create" ? organizationCreateSchema : organizationUpdateSchema
  const form = useForm<OrgFormValuesCreate | OrgFormValuesUpdate>({
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
                <Input placeholder="Nom de l'organisation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description (optionnel)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Enregistrement..." : (submitLabel ?? (mode === "create" ? "Créer" : "Enregistrer"))}
          </Button>
        </div>
      </form>
    </Form>
  )
}


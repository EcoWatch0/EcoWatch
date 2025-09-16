import { z } from "zod"

export const organizationCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const organizationUpdateSchema = organizationCreateSchema.partial()

export type OrganizationCreateSchema = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdateSchema = z.infer<typeof organizationUpdateSchema>


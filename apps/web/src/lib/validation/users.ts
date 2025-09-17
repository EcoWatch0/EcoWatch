import { z } from "zod"

export const userCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
})

export const userUpdateSchema = userCreateSchema.partial().extend({ password: z.string().min(6).optional() })

export type UserCreateSchema = z.infer<typeof userCreateSchema>
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>


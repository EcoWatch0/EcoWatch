import { z } from "zod"

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "OPERATOR", "USER"]),
  password: z.string().min(6),
})

export const userUpdateSchema = userCreateSchema.partial().extend({ password: z.string().min(6).optional() })

export type UserCreateSchema = z.infer<typeof userCreateSchema>
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>


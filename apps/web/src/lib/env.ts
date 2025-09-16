import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
})

let cachedApiUrl: string | null = null

export function getApiBaseUrl(): string {
  if (cachedApiUrl) return cachedApiUrl
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  })
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
    throw new Error(`Invalid environment variables: ${issues}`)
  }
  cachedApiUrl = parsed.data.NEXT_PUBLIC_API_URL
  return cachedApiUrl
}


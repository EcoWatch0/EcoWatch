import { getApiBaseUrl } from "@/lib/env"
import { getCookie } from "cookies-next"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface FetchJsonOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
  withAuth?: boolean
}

export class ApiError extends Error {
  public readonly status: number
  public readonly data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

function serializeBody(body: unknown): { payload: BodyInit | null; contentType?: string } {
  if (body == null) {
    return { payload: null }
  }
  if (typeof body === "string" || body instanceof FormData || body instanceof Blob) {
    return { payload: body as BodyInit }
  }
  return { payload: JSON.stringify(body), contentType: "application/json" }
}

export async function fetchJson<TResponse>(path: string, options: FetchJsonOptions = {}): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000)

  try {
    const base = getApiBaseUrl()
    const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`

    const headers: Record<string, string> = {
      ...(options.headers ?? {}),
    }

    const { payload, contentType } = serializeBody(options.body)
    if (contentType && !headers["Content-Type"]) {
      headers["Content-Type"] = contentType
    }

    // Attach Authorization header on client if requested
    if (options.withAuth !== false) {
      if (typeof window !== "undefined") {
        const token = getCookie("token") as string | undefined
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }
      }
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: payload,
      signal: options.signal ?? controller.signal,
      cache: "no-store",
    })

    const contentTypeHeader = response.headers.get("content-type") || ""
    const isJson = contentTypeHeader.includes("application/json")
    const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "")

    if (!response.ok) {
      const message = (isJson && data && typeof data === "object" && "message" in (data as Record<string, unknown>))
        ? String((data as Record<string, unknown>).message)
        : `${response.status} ${response.statusText}`
      throw new ApiError(message, response.status, data)
    }

    return data as TResponse
  } finally {
    clearTimeout(timeout)
  }
}


import type { ApiError, ApiResult } from "@/types/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5158"

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  token?: string
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    return { ok: false, error: { kind: "network" } }
  }

  if (response.status === 429) {
    return { ok: false, error: { kind: "rate-limited", status: response.status } }
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T }
  }

  const body: unknown = await response.json().catch(() => null)

  if (response.ok) {
    return { ok: true, data: body as T }
  }

  return { ok: false, error: parseErrorBody(response.status, body) }
}

function parseErrorBody(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>

    if (status === 400 && record.errors && typeof record.errors === "object") {
      return {
        kind: "validation",
        errors: record.errors as Record<string, string[]>,
        status,
      }
    }

    if (typeof record.message === "string") {
      return { kind: "business", message: record.message, status }
    }

    if (typeof record.title === "string") {
      const detail = typeof record.detail === "string" ? record.detail : record.title
      return { kind: "unexpected", message: detail, status }
    }
  }

  return {
    kind: "unexpected",
    message: "Erro inesperado. Tente novamente em instantes.",
    status,
  }
}

export const httpClient = {
  get: <T>(path: string, token?: string) => request<T>(path, { method: "GET", token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body, token }),
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", body, token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE", token }),
}

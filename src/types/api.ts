export type ValidationErrors = Record<string, string[]>

export type ApiError =
  | { kind: "validation"; errors: ValidationErrors; status?: number }
  | { kind: "business"; message: string; status?: number }
  | { kind: "rate-limited"; status?: number }
  | { kind: "unexpected"; message: string; status?: number }
  | { kind: "network"; status?: number }

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

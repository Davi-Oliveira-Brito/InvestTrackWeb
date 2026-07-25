export type ValidationErrors = Record<string, string[]>

export type ApiError =
  | { kind: "validation"; errors: ValidationErrors }
  | { kind: "business"; message: string }
  | { kind: "rate-limited" }
  | { kind: "unexpected"; message: string }
  | { kind: "network" }

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

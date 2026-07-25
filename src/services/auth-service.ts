import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nome: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  expiraEm: string
}

export function login(payload: LoginPayload): Promise<ApiResult<AuthResponse>> {
  return httpClient.post<AuthResponse>("/api/auth/login", payload)
}

export function register(payload: RegisterPayload): Promise<ApiResult<AuthResponse>> {
  return httpClient.post<AuthResponse>("/api/auth/register", payload)
}

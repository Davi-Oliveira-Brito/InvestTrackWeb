import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type {
  EditarPerfilPayload,
  FotoPerfilResponse,
  PerfilResponse,
} from "@/types/perfil"

export function getPerfil(token: string): Promise<ApiResult<PerfilResponse>> {
  return httpClient.get<PerfilResponse>("/api/perfil", token)
}

export function updatePerfil(
  payload: EditarPerfilPayload,
  token: string
): Promise<ApiResult<PerfilResponse>> {
  return httpClient.put<PerfilResponse>("/api/perfil", payload, token)
}

export function uploadFoto(
  file: File,
  token: string
): Promise<ApiResult<FotoPerfilResponse>> {
  const formData = new FormData()
  formData.append("foto", file)
  return httpClient.postForm<FotoPerfilResponse>("/api/perfil/foto", formData, token)
}

export function deleteFoto(token: string): Promise<ApiResult<void>> {
  return httpClient.delete<void>("/api/perfil/foto", token)
}

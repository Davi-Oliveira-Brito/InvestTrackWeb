import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type {
  CriarPosicaoPayload,
  EditarPosicaoPayload,
  PosicaoResponse,
} from "@/types/carteira"

export function listPosicoes(token: string): Promise<ApiResult<PosicaoResponse[]>> {
  return httpClient.get<PosicaoResponse[]>("/api/carteira", token)
}

export function createPosicao(
  payload: CriarPosicaoPayload,
  token: string
): Promise<ApiResult<PosicaoResponse>> {
  return httpClient.post<PosicaoResponse>("/api/carteira", payload, token)
}

export function updatePosicao(
  id: string,
  payload: EditarPosicaoPayload,
  token: string
): Promise<ApiResult<PosicaoResponse>> {
  return httpClient.put<PosicaoResponse>(`/api/carteira/${id}`, payload, token)
}

export function deletePosicao(id: string, token: string): Promise<ApiResult<void>> {
  return httpClient.delete<void>(`/api/carteira/${id}`, token)
}

import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type { AtivoSugestao } from "@/types/ativo"

export function buscarAtivos(
  query: string,
  token: string
): Promise<ApiResult<AtivoSugestao[]>> {
  return httpClient.get<AtivoSugestao[]>(
    `/api/ativos/buscar?query=${encodeURIComponent(query)}`,
    token
  )
}

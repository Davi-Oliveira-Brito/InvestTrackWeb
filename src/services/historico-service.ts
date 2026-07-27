import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type { HistoricoResponse } from "@/types/historico"

export function getHistorico(
  pagina: number,
  tamanho: number,
  token: string
): Promise<ApiResult<HistoricoResponse>> {
  return httpClient.get<HistoricoResponse>(
    `/api/carteira/historico?pagina=${pagina}&tamanho=${tamanho}`,
    token
  )
}

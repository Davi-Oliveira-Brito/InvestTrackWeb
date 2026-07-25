import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type { SimulacaoPayload, SimulacaoResponse } from "@/types/simulacao"

export function postSimulacao(
  payload: SimulacaoPayload,
  token: string
): Promise<ApiResult<SimulacaoResponse>> {
  return httpClient.post<SimulacaoResponse>("/api/simulacao", payload, token)
}

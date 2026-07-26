export type TipoAcaoHistorico = "Criacao" | "Edicao" | "Remocao"

export interface HistoricoItem {
  id: string
  tipoAcao: TipoAcaoHistorico
  ticker: string
  nomeAtivo: string
  quantidade: number | string
  precoMedio: number | string
  dataCompra: string
  createdAt: string
}

export type HistoricoResponse = HistoricoItem[]

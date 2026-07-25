export interface SimulacaoPayload {
  ticker: string
  valorInvestido: number
  dataInvestimento: string
}

export interface SimulacaoResponse {
  ticker: string
  valorInvestido: number | string
  dataInvestimento: string
  precoNaData: number | string
  precoAtual: number | string
  valorAtual: number | string
  rentabilidadeValor: number | string
  rentabilidadePercentual: number | string
}

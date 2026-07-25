export type TipoAtivo = "Acao" | "FII" | "RendaFixa"

export interface PosicaoResponse {
  id: string
  ticker: string
  nomeAtivo: string
  tipo: TipoAtivo
  quantidade: number | string
  precoMedio: number | string
  dataCompra: string
  precoAtual: number | string | null
  precoAtualizadoEm: string | null
  valorInvestido: number | string
  valorAtual: number | string | null
  rentabilidadeValor: number | string | null
  rentabilidadePercentual: number | string | null
}

export interface CriarPosicaoPayload {
  ticker: string
  nomeAtivo: string
  tipo: TipoAtivo
  quantidade: number
  precoMedio: number
  dataCompra: string
}

export interface EditarPosicaoPayload {
  quantidade: number
  precoMedio: number
  dataCompra: string
}

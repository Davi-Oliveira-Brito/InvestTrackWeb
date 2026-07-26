import { toNumber } from "@/lib/format"
import { TIPO_LABELS, TIPOS_ATIVO } from "@/features/carteira/tipo-ativo"
import type { PosicaoResponse, TipoAtivo } from "@/types/carteira"

export interface AlocacaoTipo {
  tipo: TipoAtivo
  label: string
  value: number
  percent: number
  color: string
}

const CORES_POR_TIPO: Record<TipoAtivo, string> = {
  Acao: "#3B82F6",
  FII: "#A855F7",
  RendaFixa: "#14B8A6",
}

export function aggregateByTipo(posicoes: PosicaoResponse[]): AlocacaoTipo[] {
  const totals: Record<TipoAtivo, number> = {
    Acao: 0,
    FII: 0,
    RendaFixa: 0,
  }

  for (const posicao of posicoes) {
    const peso = toNumber(posicao.valorAtual ?? posicao.valorInvestido)
    totals[posicao.tipo] += peso
  }

  const grandTotal = totals.Acao + totals.FII + totals.RendaFixa

  return TIPOS_ATIVO.filter((tipo) => totals[tipo] > 0).map((tipo) => ({
    tipo,
    label: TIPO_LABELS[tipo],
    value: totals[tipo],
    percent: grandTotal > 0 ? (totals[tipo] / grandTotal) * 100 : 0,
    color: CORES_POR_TIPO[tipo],
  }))
}

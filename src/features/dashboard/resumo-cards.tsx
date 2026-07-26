import { Card } from "@/components/ui/card"
import { formatCurrencyBRL, formatPercent, toNumber } from "@/lib/format"
import type { ResumoResponse } from "@/types/carteira"

interface ResumoCardsProps {
  resumo: ResumoResponse
}

export function ResumoCards({ resumo }: ResumoCardsProps) {
  const rentabilidadeConhecida =
    resumo.rentabilidadeTotalValor !== null &&
    resumo.rentabilidadeTotalPercentual !== null

  const rentabilidadeColor =
    rentabilidadeConhecida && toNumber(resumo.rentabilidadeTotalValor!) >= 0
      ? "text-positive"
      : "text-negative"

  return (
    <Card variant="metric-wrapper" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor Investido</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resumo.valorTotalInvestido)}
        </span>
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor Atual</span>
        <span className="text-2xl font-semibold text-ink">
          {resumo.valorTotalAtual === null
            ? "Cotação pendente"
            : formatCurrencyBRL(resumo.valorTotalAtual)}
        </span>
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Rentabilidade</span>
        {rentabilidadeConhecida ? (
          <span className={`text-2xl font-semibold ${rentabilidadeColor}`}>
            {formatCurrencyBRL(resumo.rentabilidadeTotalValor!)} (
            {formatPercent(resumo.rentabilidadeTotalPercentual!)})
          </span>
        ) : (
          <span className="text-2xl font-semibold text-mute">Cotação pendente</span>
        )}
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Posições</span>
        <span className="text-2xl font-semibold text-ink">
          {resumo.quantidadePosicoes}
        </span>
        {resumo.quantidadePosicoesSemCotacao > 0 && (
          <span className="text-xs text-mute">
            {resumo.quantidadePosicoesSemCotacao} aguardando cotação
          </span>
        )}
      </Card>
    </Card>
  )
}

import { Card } from "@/components/ui/card"
import { InfoHint } from "@/components/ui/info-hint"
import { formatCurrencyBRL, formatPercent, toNumber } from "@/lib/format"
import type { ResumoResponse } from "@/types/carteira"

interface ResumoCardsProps {
  resumo: ResumoResponse
}

interface MetricLabelProps {
  label: string
  info: string
}

function MetricLabel({ label, info }: MetricLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-mute">{label}</span>
      <InfoHint label={`Sobre ${label}`}>{info}</InfoHint>
    </div>
  )
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
        <MetricLabel
          label="Valor Investido"
          info="Soma do valor pago em todas as suas posições, no preço médio de compra."
        />
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resumo.valorTotalInvestido)}
        </span>
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <MetricLabel
          label="Valor Atual"
          info="Soma do valor de mercado de todas as suas posições, com base na cotação mais recente disponível."
        />
        <span className="text-2xl font-semibold text-ink">
          {resumo.valorTotalAtual === null
            ? "Cotação pendente"
            : formatCurrencyBRL(resumo.valorTotalAtual)}
        </span>
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <MetricLabel
          label="Rentabilidade"
          info="Diferença entre o valor atual e o valor investido, em R$ e em %."
        />
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
        <MetricLabel
          label="Posições"
          info="Número total de ativos cadastrados na sua carteira."
        />
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

import { formatCurrencyBRL, formatDateBR, formatPercent, toNumber } from "@/lib/format"
import type { SimulacaoResponse } from "@/types/simulacao"

interface SimulacaoResultCardProps {
  resultado: SimulacaoResponse
}

export function SimulacaoResultCard({ resultado }: SimulacaoResultCardProps) {
  const rentabilidadeColor =
    toNumber(resultado.rentabilidadeValor) >= 0 ? "text-positive" : "text-negative"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">
          {resultado.ticker} em {formatDateBR(resultado.dataInvestimento)}
        </span>
        <span className="text-sm text-ink">
          Preço na data: {formatCurrencyBRL(resultado.precoNaData)} · Preço atual:{" "}
          {formatCurrencyBRL(resultado.precoAtual)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor investido</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resultado.valorInvestido)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor atual</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resultado.valorAtual)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">Rentabilidade</span>
        <span className={`text-2xl font-semibold ${rentabilidadeColor}`}>
          {formatCurrencyBRL(resultado.rentabilidadeValor)} (
          {formatPercent(resultado.rentabilidadePercentual)})
        </span>
      </div>
    </div>
  )
}

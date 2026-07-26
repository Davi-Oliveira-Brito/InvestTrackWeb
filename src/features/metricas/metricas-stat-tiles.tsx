import { Info } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPercent, toNumber } from "@/lib/format"
import type { MetricasResponse } from "@/types/carteira"

interface MetricasStatTilesProps {
  metricas: MetricasResponse
}

interface LinhaResumoProps {
  label: string
  valor: string
  info: string
}

function LinhaResumo({ label, valor, info }: LinhaResumoProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-mute">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-ink">{valor}</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`Sobre ${label}`}
                className="flex size-5 items-center justify-center rounded-full text-mute hover:text-ink"
              />
            }
          >
            <Info className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{info}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export function MetricasStatTiles({ metricas }: MetricasStatTilesProps) {
  return (
    <div className="flex flex-col gap-2">
      <Card variant="resumo-linhas" className="flex flex-col divide-y divide-border">
        <LinhaResumo
          label="Volatilidade Anualizada"
          valor={formatPercent(metricas.volatilidadeAnualizada)}
          info="Mede o quanto o retorno da carteira varia ao longo do tempo."
        />
        <LinhaResumo
          label="Sharpe Ratio"
          valor={toNumber(metricas.sharpeRatio).toFixed(2)}
          info="Retorno ajustado ao risco: quanto maior, melhor a relação entre retorno e volatilidade."
        />
        <LinhaResumo
          label="Drawdown Máximo"
          valor={formatPercent(metricas.drawdownMaximo)}
          info="A maior queda registrada do valor da carteira em relação ao seu pico anterior."
        />
      </Card>
      <p className="text-xs text-mute">
        Baseado em {toNumber(metricas.diasConsiderados)} dias de histórico.
      </p>
    </div>
  )
}

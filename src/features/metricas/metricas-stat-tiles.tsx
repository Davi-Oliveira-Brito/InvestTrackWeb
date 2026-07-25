import { Card } from "@/components/ui/card"
import { formatPercent, toNumber } from "@/lib/format"
import type { MetricasResponse } from "@/types/carteira"

interface MetricasStatTilesProps {
  metricas: MetricasResponse
}

export function MetricasStatTiles({ metricas }: MetricasStatTilesProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <span className="text-sm text-mute">Volatilidade Anualizada</span>
          <span className="text-2xl font-semibold text-ink">
            {formatPercent(metricas.volatilidadeAnualizada)}
          </span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-sm text-mute">Sharpe Ratio</span>
          <span className="text-2xl font-semibold text-ink">
            {toNumber(metricas.sharpeRatio).toFixed(2)}
          </span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-sm text-mute">Drawdown Máximo</span>
          <span className="text-2xl font-semibold text-ink">
            {formatPercent(metricas.drawdownMaximo)}
          </span>
        </Card>
      </div>

      <p className="text-xs text-mute">
        Baseado em {toNumber(metricas.diasConsiderados)} dias de histórico.
      </p>
    </div>
  )
}

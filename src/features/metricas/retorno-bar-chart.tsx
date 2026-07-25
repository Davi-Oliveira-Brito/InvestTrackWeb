import { formatPercent } from "@/lib/format"

export interface RetornoBarItem {
  label: string
  value: number | null
  color: string
}

interface RetornoBarChartProps {
  itens: RetornoBarItem[]
}

export function RetornoBarChart({ itens }: RetornoBarChartProps) {
  const valoresConhecidos = itens
    .map((item) => item.value)
    .filter((value): value is number => value !== null)
  const maxAbs = Math.max(...valoresConhecidos.map((value) => Math.abs(value)), 1)

  return (
    <div className="flex flex-col gap-4">
      {itens.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-sm text-ink">{item.label}</span>

          {item.value === null ? (
            <span className="flex-1 text-sm text-mute">indisponível</span>
          ) : (
            <div className="relative h-6 flex-1 rounded-md bg-canvas-soft">
              <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
              <div
                className="absolute inset-y-0 rounded-md"
                style={{
                  backgroundColor: item.color,
                  left:
                    item.value >= 0
                      ? "50%"
                      : `${50 - (Math.abs(item.value) / maxAbs) * 50}%`,
                  width: `${(Math.abs(item.value) / maxAbs) * 50}%`,
                }}
              />
            </div>
          )}

          <span className="w-16 shrink-0 text-right text-sm font-semibold text-ink">
            {item.value === null ? "" : formatPercent(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

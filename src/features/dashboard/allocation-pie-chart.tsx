import { formatCurrencyBRL, formatPercent } from "@/lib/format"
import type { AlocacaoTipo } from "./aggregate-by-tipo"

const SIZE = 200
const RADIUS = 90
const CENTER = SIZE / 2

function polarToCartesian(angleDeg: number): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  }
}

function describeSlice(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(endAngle)
  const end = polarToCartesian(startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

interface AllocationPieChartProps {
  alocacao: AlocacaoTipo[]
}

export function AllocationPieChart({ alocacao }: AllocationPieChartProps) {
  if (alocacao.length === 0) return null

  const cumulativeEndAngles = alocacao.reduce<number[]>((acc, item, index) => {
    const previousEnd = index === 0 ? 0 : acc[index - 1]
    acc.push(previousEnd + (item.percent / 100) * 360)
    return acc
  }, [])

  const slices = alocacao.map((item, index) => ({
    ...item,
    startAngle: index === 0 ? 0 : cumulativeEndAngles[index - 1],
    endAngle: cumulativeEndAngles[index],
  }))

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Alocação da carteira por tipo de ativo"
      >
        {slices.length === 1 ? (
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={slices[0].color}>
            <title>
              {`${slices[0].label} — ${formatCurrencyBRL(slices[0].value)} (${formatPercent(slices[0].percent)})`}
            </title>
          </circle>
        ) : (
          slices.map((slice) => (
            <path
              key={slice.tipo}
              d={describeSlice(slice.startAngle, slice.endAngle)}
              fill={slice.color}
            >
              <title>
                {`${slice.label} — ${formatCurrencyBRL(slice.value)} (${formatPercent(slice.percent)})`}
              </title>
            </path>
          ))
        )}
      </svg>

      <ul className="flex w-full flex-col gap-2">
        {alocacao.map((item) => (
          <li
            key={item.tipo}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-ink">{item.label}</span>
            </span>
            <span className="text-mute">{formatPercent(item.percent)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

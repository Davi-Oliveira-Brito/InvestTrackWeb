const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 8,
})

export function toNumber(value: number | string): number {
  return typeof value === "number" ? value : Number(value)
}

export function formatCurrencyBRL(value: number | string): string {
  return currencyFormatter.format(toNumber(value))
}

/** Assumes `value` is already in percentage points (12.5 = 12,5%), not a fraction. */
export function formatPercent(value: number | string): string {
  return `${percentFormatter.format(toNumber(value))}%`
}

export function formatNumber(value: number | string): string {
  return numberFormatter.format(toNumber(value))
}

export function formatDateBR(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export function validateTicker(ticker: string): string | undefined {
  if (ticker.trim().length === 0) return "Informe o ticker."
  if (ticker.length > 20) return "O ticker deve ter no máximo 20 caracteres."
  return undefined
}

export function validateValorInvestido(valorInvestido: string): string | undefined {
  if (valorInvestido.trim().length === 0) return "Informe o valor investido."
  const valor = Number(valorInvestido)
  if (!Number.isFinite(valor) || valor < 0.01) {
    return "O valor investido deve ser de no mínimo R$ 0,01."
  }
  return undefined
}

export function validateDataInvestimento(dataInvestimento: string): string | undefined {
  if (dataInvestimento.trim().length === 0) return "Informe a data do investimento."
  if (Number.isNaN(Date.parse(dataInvestimento))) return "Informe uma data válida."
  return undefined
}

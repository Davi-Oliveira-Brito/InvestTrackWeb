import type { TipoAtivo } from "@/types/carteira"

const TIPOS_ATIVO: TipoAtivo[] = ["Acao", "FII", "RendaFixa"]

export function validateTicker(ticker: string): string | undefined {
  if (ticker.trim().length === 0) return "Informe o ticker."
  if (ticker.length > 20) return "O ticker deve ter no máximo 20 caracteres."
  return undefined
}

export function validateNomeAtivo(nomeAtivo: string): string | undefined {
  if (nomeAtivo.trim().length === 0) return "Informe o nome do ativo."
  if (nomeAtivo.length > 200) return "O nome deve ter no máximo 200 caracteres."
  return undefined
}

export function validateTipo(tipo: string): string | undefined {
  if (!TIPOS_ATIVO.includes(tipo as TipoAtivo)) return "Selecione o tipo do ativo."
  return undefined
}

export function validateQuantidade(quantidade: string): string | undefined {
  if (quantidade.trim().length === 0) return "Informe a quantidade."
  const valor = Number(quantidade)
  if (!Number.isFinite(valor) || valor <= 0) return "A quantidade deve ser maior que zero."
  return undefined
}

export function validatePrecoMedio(precoMedio: string): string | undefined {
  if (precoMedio.trim().length === 0) return "Informe o preço médio."
  const valor = Number(precoMedio)
  if (!Number.isFinite(valor) || valor < 0.01) return "O preço médio deve ser de no mínimo R$ 0,01."
  return undefined
}

export function validateDataCompra(dataCompra: string): string | undefined {
  if (dataCompra.trim().length === 0) return "Informe a data da compra."
  if (Number.isNaN(Date.parse(dataCompra))) return "Informe uma data válida."
  return undefined
}

import type { TipoAtivo } from "@/types/carteira"

export const TIPOS_ATIVO: TipoAtivo[] = ["Acao", "FII", "RendaFixa"]

export const TIPO_LABELS: Record<TipoAtivo, string> = {
  Acao: "Ação",
  FII: "FII",
  RendaFixa: "Renda Fixa",
}

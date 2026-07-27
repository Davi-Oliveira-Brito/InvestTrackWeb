export type TipoAtivoBuscavel = "Acao" | "FII"

export interface AtivoSugestao {
  ticker: string
  nome: string
  tipo: TipoAtivoBuscavel
}

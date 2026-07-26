"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/form-alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/features/auth/auth-provider"
import { formatCurrencyBRL, formatDateBR, formatNumber, toNumber } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { getHistorico } from "@/services/historico-service"
import type { HistoricoItem } from "@/types/historico"

const TAMANHO_PAGINA = 20

const TIPO_LABELS: Record<HistoricoItem["tipoAcao"], string> = {
  Criacao: "Criação",
  Edicao: "Edição",
  Remocao: "Remoção",
}

const TIPO_CLASSNAMES: Record<HistoricoItem["tipoAcao"], string> = {
  Criacao: "text-positive",
  Edicao: "text-body",
  Remocao: "text-negative",
}

export default function HistoricoPage() {
  const { token } = useAuth()

  const [pagina, setPagina] = useState(1)
  const [itens, setItens] = useState<HistoricoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchHistorico = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setLoadError(null)
    const result = await getHistorico(pagina, TAMANHO_PAGINA, token)
    setIsLoading(false)

    if (!result.ok) {
      setLoadError(getApiErrorMessage(result.error))
      return
    }
    setItens(result.data)
  }, [token, pagina])

  useEffect(() => {
    fetchHistorico()
  }, [fetchHistorico])

  if (!token) return null

  const hasProximaPagina = itens.length === TAMANHO_PAGINA

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Histórico
        </h1>

        {isLoading && <p className="text-body">Carregando...</p>}

        {!isLoading && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchHistorico}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !loadError && itens.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Nenhuma transação encontrada ainda.</p>
          </div>
        )}

        {!isLoading && !loadError && itens.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço unitário</TableHead>
                  <TableHead>Valor total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDateBR(item.createdAt)}</TableCell>
                    <TableCell className={TIPO_CLASSNAMES[item.tipoAcao]}>
                      {TIPO_LABELS[item.tipoAcao]}
                    </TableCell>
                    <TableCell className="font-semibold">{item.ticker}</TableCell>
                    <TableCell>{item.nomeAtivo}</TableCell>
                    <TableCell>{formatNumber(item.quantidade)}</TableCell>
                    <TableCell>{formatCurrencyBRL(item.precoMedio)}</TableCell>
                    <TableCell>
                      {formatCurrencyBRL(toNumber(item.quantidade) * toNumber(item.precoMedio))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                disabled={pagina === 1}
                onClick={() => setPagina((value) => Math.max(1, value - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={!hasProximaPagina}
                onClick={() => setPagina((value) => value + 1)}
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

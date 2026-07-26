"use client"

import { Pencil, Trash2 } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DeletePosicaoDialog } from "@/features/carteira/delete-posicao-dialog"
import { PosicaoFormDialog } from "@/features/carteira/posicao-form-dialog"
import { TIPO_LABELS } from "@/features/carteira/tipo-ativo"
import { useAuth } from "@/features/auth/auth-provider"
import {
  formatCurrencyBRL,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { listPosicoes } from "@/services/carteira-service"
import type { PosicaoResponse } from "@/types/carteira"

export default function CarteiraPage() {
  const { token } = useAuth()

  const [posicoes, setPosicoes] = useState<PosicaoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingPosicao, setEditingPosicao] = useState<PosicaoResponse | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPosicao, setDeletingPosicao] = useState<PosicaoResponse | null>(null)

  const fetchPosicoes = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setLoadError(null)
    const result = await listPosicoes(token)
    setIsLoading(false)

    if (!result.ok) {
      setLoadError(getApiErrorMessage(result.error))
      return
    }
    setPosicoes(result.data)
  }, [token])

  useEffect(() => {
    fetchPosicoes()
  }, [fetchPosicoes])

  if (!token) return null

  function openCreateDialog() {
    setEditingPosicao(null)
    setFormOpen(true)
  }

  function openEditDialog(posicao: PosicaoResponse) {
    setEditingPosicao(posicao)
    setFormOpen(true)
  }

  function openDeleteDialog(posicao: PosicaoResponse) {
    setDeletingPosicao(posicao)
    setDeleteOpen(true)
  }

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Minha Carteira
          </h1>
          <Button onClick={openCreateDialog}>Adicionar posição</Button>
        </div>

        {isLoading && <p className="text-body">Carregando...</p>}

        {!isLoading && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchPosicoes}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !loadError && posicoes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button onClick={openCreateDialog}>Adicionar primeira posição</Button>
          </div>
        )}

        {!isLoading && !loadError && posicoes.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço médio</TableHead>
                  <TableHead>Preço atual</TableHead>
                  <TableHead>Valor atual</TableHead>
                  <TableHead>Rentabilidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posicoes.map((posicao) => (
                  <TableRow key={posicao.id}>
                    <TableCell className="font-semibold">{posicao.ticker}</TableCell>
                    <TableCell>{posicao.nomeAtivo}</TableCell>
                    <TableCell>{TIPO_LABELS[posicao.tipo]}</TableCell>
                    <TableCell>{formatNumber(posicao.quantidade)}</TableCell>
                    <TableCell>{formatCurrencyBRL(posicao.precoMedio)}</TableCell>
                    <TableCell>
                      {posicao.precoAtual === null ? (
                        <span className="text-mute">Cotação pendente</span>
                      ) : (
                        formatCurrencyBRL(posicao.precoAtual)
                      )}
                    </TableCell>
                    <TableCell>
                      {posicao.valorAtual === null ? (
                        <span className="text-mute">Cotação pendente</span>
                      ) : (
                        formatCurrencyBRL(posicao.valorAtual)
                      )}
                    </TableCell>
                    <TableCell>
                      {posicao.rentabilidadeValor === null ||
                      posicao.rentabilidadePercentual === null ? (
                        <span className="text-mute">Cotação pendente</span>
                      ) : (
                        <span
                          className={
                            toNumber(posicao.rentabilidadeValor) >= 0
                              ? "text-positive"
                              : "text-negative"
                          }
                        >
                          {formatCurrencyBRL(posicao.rentabilidadeValor)} (
                          {formatPercent(posicao.rentabilidadePercentual)})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                aria-label={`Editar ${posicao.ticker}`}
                                onClick={() => openEditDialog(posicao)}
                                className="flex size-8 items-center justify-center rounded-md text-body transition-colors hover:bg-muted hover:text-ink"
                              />
                            }
                          >
                            <Pencil className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                aria-label={`Remover ${posicao.ticker}`}
                                onClick={() => openDeleteDialog(posicao)}
                                className="flex size-8 items-center justify-center rounded-md text-body transition-colors hover:bg-destructive/10 hover:text-destructive"
                              />
                            }
                          >
                            <Trash2 className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent>Remover</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <PosicaoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        posicao={editingPosicao}
        token={token}
        onSaved={fetchPosicoes}
      />
      <DeletePosicaoDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        posicao={deletingPosicao}
        token={token}
        onDeleted={fetchPosicoes}
      />
    </main>
  )
}

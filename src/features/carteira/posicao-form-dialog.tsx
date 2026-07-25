"use client"

import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import {
  createPosicao,
  updatePosicao,
} from "@/services/carteira-service"
import type { PosicaoResponse, TipoAtivo } from "@/types/carteira"
import {
  validateDataCompra,
  validateNomeAtivo,
  validatePrecoMedio,
  validateQuantidade,
  validateTicker,
  validateTipo,
} from "@/features/carteira/validation"

const TIPO_LABELS: Record<TipoAtivo, string> = {
  Acao: "Ação",
  FII: "FII",
  RendaFixa: "Renda Fixa",
}

interface FieldErrors {
  ticker?: string
  nomeAtivo?: string
  tipo?: string
  quantidade?: string
  precoMedio?: string
  dataCompra?: string
}

interface PosicaoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  posicao: PosicaoResponse | null
  token: string
  onSaved: () => void
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10)
}

function toDataCompraIso(dateInputValue: string): string {
  return new Date(`${dateInputValue}T00:00:00Z`).toISOString()
}

export function PosicaoFormDialog({
  open,
  onOpenChange,
  posicao,
  token,
  onSaved,
}: PosicaoFormDialogProps) {
  const isEdit = posicao !== null

  const [ticker, setTicker] = useState("")
  const [nomeAtivo, setNomeAtivo] = useState("")
  const [tipo, setTipo] = useState<string>("")
  const [quantidade, setQuantidade] = useState("")
  const [precoMedio, setPrecoMedio] = useState("")
  const [dataCompra, setDataCompra] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setFieldErrors({})
    setFormError(null)

    if (posicao) {
      setTicker(posicao.ticker)
      setNomeAtivo(posicao.nomeAtivo)
      setTipo(posicao.tipo)
      setQuantidade(String(posicao.quantidade))
      setPrecoMedio(String(posicao.precoMedio))
      setDataCompra(toDateInputValue(posicao.dataCompra))
    } else {
      setTicker("")
      setNomeAtivo("")
      setTipo("")
      setQuantidade("")
      setPrecoMedio("")
      setDataCompra("")
    }
  }, [open, posicao])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      quantidade: validateQuantidade(quantidade),
      precoMedio: validatePrecoMedio(precoMedio),
      dataCompra: validateDataCompra(dataCompra),
    }
    if (!isEdit) {
      errors.ticker = validateTicker(ticker)
      errors.nomeAtivo = validateNomeAtivo(nomeAtivo)
      errors.tipo = validateTipo(tipo)
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setIsSubmitting(true)
    const result = isEdit
      ? await updatePosicao(
          posicao.id,
          {
            quantidade: Number(quantidade),
            precoMedio: Number(precoMedio),
            dataCompra: toDataCompraIso(dataCompra),
          },
          token
        )
      : await createPosicao(
          {
            ticker,
            nomeAtivo,
            tipo: tipo as TipoAtivo,
            quantidade: Number(quantidade),
            precoMedio: Number(precoMedio),
            dataCompra: toDataCompraIso(dataCompra),
          },
          token
        )
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          ticker: pickError(result.error.errors, "ticker", "Ticker"),
          nomeAtivo: pickError(result.error.errors, "nomeAtivo", "NomeAtivo"),
          tipo: pickError(result.error.errors, "tipo", "Tipo"),
          quantidade: pickError(result.error.errors, "quantidade", "Quantidade"),
          precoMedio: pickError(result.error.errors, "precoMedio", "PrecoMedio"),
          dataCompra: pickError(result.error.errors, "dataCompra", "DataCompra"),
        })
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar posição" : "Adicionar posição"}</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <FormAlert>{formError}</FormAlert>

          {isEdit ? (
            <div className="rounded-md bg-canvas-soft px-4 py-3 text-sm text-ink">
              <p className="font-semibold">{posicao.ticker}</p>
              <p className="text-body">
                {posicao.nomeAtivo} · {TIPO_LABELS[posicao.tipo]}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(event) => setTicker(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.ticker)}
                />
                <FieldError>{fieldErrors.ticker}</FieldError>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nomeAtivo">Nome do ativo</Label>
                <Input
                  id="nomeAtivo"
                  value={nomeAtivo}
                  onChange={(event) => setNomeAtivo(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.nomeAtivo)}
                />
                <FieldError>{fieldErrors.nomeAtivo}</FieldError>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={(value) => setTipo(value ?? "")}>
                  <SelectTrigger id="tipo" className="w-full" aria-invalid={Boolean(fieldErrors.tipo)}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acao">Ação</SelectItem>
                    <SelectItem value="FII">FII</SelectItem>
                    <SelectItem value="RendaFixa">Renda Fixa</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError>{fieldErrors.tipo}</FieldError>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              step="any"
              min="0"
              value={quantidade}
              onChange={(event) => setQuantidade(event.target.value)}
              aria-invalid={Boolean(fieldErrors.quantidade)}
            />
            <FieldError>{fieldErrors.quantidade}</FieldError>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="precoMedio">Preço médio</Label>
            <Input
              id="precoMedio"
              type="number"
              step="0.01"
              min="0"
              value={precoMedio}
              onChange={(event) => setPrecoMedio(event.target.value)}
              aria-invalid={Boolean(fieldErrors.precoMedio)}
            />
            <FieldError>{fieldErrors.precoMedio}</FieldError>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dataCompra">Data da compra</Label>
            <Input
              id="dataCompra"
              type="date"
              value={dataCompra}
              onChange={(event) => setDataCompra(event.target.value)}
              aria-invalid={Boolean(fieldErrors.dataCompra)}
            />
            <FieldError>{fieldErrors.dataCompra}</FieldError>
          </div>

          <DialogFooter className="-mx-0 -mb-0 border-t-0 bg-transparent p-0 sm:justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

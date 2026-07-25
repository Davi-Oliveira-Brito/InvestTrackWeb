"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  validateDataInvestimento,
  validateTicker,
  validateValorInvestido,
} from "@/features/simulador/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { postSimulacao } from "@/services/simulacao-service"
import type { SimulacaoResponse } from "@/types/simulacao"

interface FieldErrors {
  ticker?: string
  valorInvestido?: string
  dataInvestimento?: string
}

interface SimuladorFormProps {
  token: string
  onResult: (resultado: SimulacaoResponse) => void
}

function toDataInvestimentoIso(dateInputValue: string): string {
  return new Date(`${dateInputValue}T00:00:00Z`).toISOString()
}

export function SimuladorForm({ token, onResult }: SimuladorFormProps) {
  const [ticker, setTicker] = useState("")
  const [valorInvestido, setValorInvestido] = useState("")
  const [dataInvestimento, setDataInvestimento] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      ticker: validateTicker(ticker),
      valorInvestido: validateValorInvestido(valorInvestido),
      dataInvestimento: validateDataInvestimento(dataInvestimento),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setIsSubmitting(true)
    const result = await postSimulacao(
      {
        ticker,
        valorInvestido: Number(valorInvestido),
        dataInvestimento: toDataInvestimentoIso(dataInvestimento),
      },
      token
    )
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          ticker: pickError(result.error.errors, "ticker", "Ticker"),
          valorInvestido: pickError(result.error.errors, "valorInvestido", "ValorInvestido"),
          dataInvestimento: pickError(
            result.error.errors,
            "dataInvestimento",
            "DataInvestimento"
          ),
        })
        return
      }
      if (result.error.status === 404) {
        setFormError("Não encontramos cotação para esse ticker na data informada.")
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    onResult(result.data)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <FormAlert>{formError}</FormAlert>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ticker">Ticker</Label>
        <Input
          id="ticker"
          value={ticker}
          onChange={(event) => setTicker(event.target.value.toUpperCase())}
          aria-invalid={Boolean(fieldErrors.ticker)}
        />
        <p className="text-xs text-mute">
          Hoje só PETR4, MGLU3, VALE3 e ITUB4 têm cotação disponível em produção.
        </p>
        <FieldError>{fieldErrors.ticker}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="valorInvestido">Valor investido</Label>
        <Input
          id="valorInvestido"
          type="number"
          step="0.01"
          min="0"
          value={valorInvestido}
          onChange={(event) => setValorInvestido(event.target.value)}
          aria-invalid={Boolean(fieldErrors.valorInvestido)}
        />
        <FieldError>{fieldErrors.valorInvestido}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dataInvestimento">Data do investimento</Label>
        <Input
          id="dataInvestimento"
          type="date"
          value={dataInvestimento}
          onChange={(event) => setDataInvestimento(event.target.value)}
          aria-invalid={Boolean(fieldErrors.dataInvestimento)}
        />
        <FieldError>{fieldErrors.dataInvestimento}</FieldError>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Simulando..." : "Simular"}
      </Button>
    </form>
  )
}

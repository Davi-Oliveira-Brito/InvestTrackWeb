"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/form-alert"
import { Section } from "@/components/ui/section"
import { useAuth } from "@/features/auth/auth-provider"
import { MetricasStatTiles } from "@/features/metricas/metricas-stat-tiles"
import { RetornoBarChart, type RetornoBarItem } from "@/features/metricas/retorno-bar-chart"
import { toNumber } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { getMetricas } from "@/services/carteira-service"
import type { MetricasResponse } from "@/types/carteira"

export default function MetricasPage() {
  const { token } = useAuth()

  const [metricas, setMetricas] = useState<MetricasResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchMetricas = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setIsEmpty(false)
    setLoadError(null)

    const result = await getMetricas(token)
    setIsLoading(false)

    if (!result.ok) {
      if (result.error.status === 400) {
        setIsEmpty(true)
        return
      }
      if (result.error.status === 503) {
        setLoadError("Métricas indisponíveis no momento. Tente novamente mais tarde.")
        return
      }
      setLoadError(getApiErrorMessage(result.error))
      return
    }

    setMetricas(result.data)
  }, [token])

  useEffect(() => {
    Promise.resolve().then(fetchMetricas)
  }, [fetchMetricas])

  if (!token) return null

  const itensRetorno: RetornoBarItem[] = metricas
    ? [
        {
          label: "Carteira",
          value: toNumber(metricas.retornoAnualizadoCarteira),
          color: "#3B82F6",
        },
        {
          label: "CDI",
          value: toNumber(metricas.retornoAnualizadoCdi),
          color: "#A855F7",
        },
        {
          label: "Ibovespa",
          value:
            metricas.retornoAnualizadoIbovespa === null
              ? null
              : toNumber(metricas.retornoAnualizadoIbovespa),
          color: "#14B8A6",
        },
      ]
    : []

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Métricas
        </h1>

        {isLoading && (
          <p className="text-body">
            Calculando métricas... isso pode levar alguns segundos.
          </p>
        )}

        {!isLoading && isEmpty && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button
              render={<Link href="/carteira">Adicionar posição</Link>}
              nativeButton={false}
              className="mt-2"
            />
          </div>
        )}

        {!isLoading && !isEmpty && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchMetricas}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !isEmpty && !loadError && metricas && (
          <div className="flex flex-col gap-6">
            <Section
              title="Carteira vs. CDI vs. Ibovespa"
              info="Compara o retorno anualizado da sua carteira com dois benchmarks de referência: o CDI (renda fixa) e o Ibovespa (bolsa)."
            >
              <RetornoBarChart itens={itensRetorno} />
            </Section>
            <MetricasStatTiles metricas={metricas} />
          </div>
        )}
      </div>
    </main>
  )
}

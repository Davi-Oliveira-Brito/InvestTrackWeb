"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormAlert } from "@/components/ui/form-alert"
import { useAuth } from "@/features/auth/auth-provider"
import { aggregateByTipo } from "@/features/dashboard/aggregate-by-tipo"
import { AllocationPieChart } from "@/features/dashboard/allocation-pie-chart"
import { ResumoCards } from "@/features/dashboard/resumo-cards"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { getResumo, listPosicoes } from "@/services/carteira-service"
import type { PosicaoResponse, ResumoResponse } from "@/types/carteira"

export default function DashboardPage() {
  const { token } = useAuth()

  const [resumo, setResumo] = useState<ResumoResponse | null>(null)
  const [posicoes, setPosicoes] = useState<PosicaoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setLoadError(null)

    const [resumoResult, posicoesResult] = await Promise.all([
      getResumo(token),
      listPosicoes(token),
    ])

    setIsLoading(false)

    if (!resumoResult.ok) {
      setLoadError(getApiErrorMessage(resumoResult.error))
      return
    }
    if (!posicoesResult.ok) {
      setLoadError(getApiErrorMessage(posicoesResult.error))
      return
    }

    setResumo(resumoResult.data)
    setPosicoes(posicoesResult.data)
  }, [token])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (!token) return null

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Dashboard
        </h1>

        {isLoading && <p className="text-body">Carregando...</p>}

        {!isLoading && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchDashboard}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes === 0 && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button render={<Link href="/carteira">Adicionar posição</Link>} nativeButton={false} />
          </Card>
        )}

        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ResumoCards resumo={resumo} />
            <Card className="flex items-center justify-center">
              <AllocationPieChart alocacao={aggregateByTipo(posicoes)} />
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}

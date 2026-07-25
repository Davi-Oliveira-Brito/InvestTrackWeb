"use client"

import { useState } from "react"

import { useAuth } from "@/features/auth/auth-provider"
import { SimulacaoResultCard } from "@/features/simulador/simulacao-result-card"
import { SimuladorForm } from "@/features/simulador/simulador-form"
import type { SimulacaoResponse } from "@/types/simulacao"

export default function SimuladorPage() {
  const { token } = useAuth()
  const [resultado, setResultado] = useState<SimulacaoResponse | null>(null)

  if (!token) return null

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Simulador
        </h1>

        <SimuladorForm token={token} onResult={setResultado} />

        {resultado && <SimulacaoResultCard resultado={resultado} />}
      </div>
    </main>
  )
}

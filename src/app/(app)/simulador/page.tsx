"use client"

import { useState } from "react"

import { Section } from "@/components/ui/section"
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

        <Section
          title="Simular investimento"
          info="Estime quanto um investimento teria rendido se tivesse sido feito em uma data passada, com base na cotação do ativo."
        >
          <SimuladorForm token={token} onResult={setResultado} />
        </Section>

        {resultado && (
          <Section
            title="Resultado da simulação"
            info="Compara o valor investido na data escolhida com o valor atual do ativo, mostrando o ganho ou perda no período."
          >
            <SimulacaoResultCard resultado={resultado} />
          </Section>
        )}
      </div>
    </main>
  )
}

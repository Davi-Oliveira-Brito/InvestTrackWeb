"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormAlert } from "@/components/ui/form-alert"
import { useAuth } from "@/features/auth/auth-provider"
import { PerfilForm } from "@/features/perfil/perfil-form"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { getPerfil } from "@/services/perfil-service"
import type { PerfilResponse } from "@/types/perfil"

export default function PerfilPage() {
  const { token } = useAuth()

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchPerfil = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setLoadError(null)
    const result = await getPerfil(token)
    setIsLoading(false)

    if (!result.ok) {
      setLoadError(getApiErrorMessage(result.error))
      return
    }
    setPerfil(result.data)
  }, [token])

  useEffect(() => {
    Promise.resolve().then(fetchPerfil)
  }, [fetchPerfil])

  if (!token) return null

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Perfil
        </h1>

        {isLoading && <p className="text-body">Carregando...</p>}

        {!isLoading && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchPerfil}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !loadError && perfil && (
          <Card>
            <PerfilForm token={token} perfil={perfil} onUpdated={setPerfil} />
          </Card>
        )}
      </div>
    </main>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-provider"

export default function DashboardPage() {
  const { logout } = useAuth()

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-canvas-soft px-6 py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="text-body">
          Sua sessão está ativa. O conteúdo da carteira chega nos próximos sprints.
        </p>
        <Button size="xl" variant="outline" onClick={logout}>
          Sair
        </Button>
      </div>
    </main>
  )
}

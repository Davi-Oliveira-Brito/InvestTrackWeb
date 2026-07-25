"use client"

import Link from "next/link"

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
          Sua sessão está ativa. Os cards de resumo chegam nos próximos sprints.
        </p>
        <div className="mt-2 flex gap-3">
          <Button
            render={<Link href="/carteira">Minha carteira</Link>}
            nativeButton={false}
            size="xl"
          />
          <Button size="xl" variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </main>
  )
}

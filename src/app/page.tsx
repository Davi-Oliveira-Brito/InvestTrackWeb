import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-canvas-soft px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="text-sm font-semibold text-body">InvestTrack</span>
        <h1 className="font-heading text-4xl font-black tracking-tight text-ink sm:text-5xl md:text-6xl">
          Sua carteira de investimentos, sob controle.
        </h1>
        <p className="max-w-xl text-lg text-body">
          Acompanhe rentabilidade, risco e comparação com benchmarks em um só
          lugar — sem planilha, sem retrabalho.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/registro">Criar conta</Link>} nativeButton={false} size="xl" />
          <Button
            render={<Link href="/login">Entrar</Link>}
            nativeButton={false}
            variant="secondary"
            size="xl"
          />
        </div>
      </div>
    </main>
  )
}

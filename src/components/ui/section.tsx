import type { ReactNode } from "react"

import { InfoHint } from "@/components/ui/info-hint"
import { cn } from "@/lib/utils"

interface SectionProps {
  title: string
  info?: string
  children: ReactNode
  className?: string
}

export function Section({ title, info, children, className }: SectionProps) {
  return (
    <section className={cn("rounded-lg bg-canvas p-4 shadow-sm", className)}>
      <header className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
        {info && <InfoHint label="Mais informações">{info}</InfoHint>}
      </header>
      {children}
    </section>
  )
}

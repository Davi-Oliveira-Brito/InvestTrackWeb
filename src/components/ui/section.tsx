import { Info } from "lucide-react"
import type { ReactNode } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SectionProps {
  title: string
  info?: string
  children: ReactNode
  className?: string
}

export function Section({ title, info, children, className }: SectionProps) {
  return (
    <section className={cn("rounded-md border border-border bg-canvas p-4", className)}>
      <header className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
        {info && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Mais informações"
                  className="flex size-5 items-center justify-center rounded-full text-mute hover:text-ink"
                />
              }
            >
              <Info className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{info}</TooltipContent>
          </Tooltip>
        )}
      </header>
      {children}
    </section>
  )
}

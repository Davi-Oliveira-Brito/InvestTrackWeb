"use client"

import { Info } from "lucide-react"
import type { ReactNode } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface InfoHintProps {
  label: string
  children: ReactNode
}

export function InfoHint({ label, children }: InfoHintProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={label}
            className="flex size-5 cursor-pointer items-center justify-center rounded-full text-mute hover:bg-canvas-soft hover:text-ink"
          />
        }
      >
        <Info className="size-4" />
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  )
}

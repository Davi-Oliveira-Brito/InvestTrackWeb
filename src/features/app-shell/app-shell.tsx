"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SidebarNav } from "@/features/app-shell/sidebar-nav"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-canvas md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <SidebarNav />
      </aside>

      <div className="flex items-center justify-between border-b border-border bg-canvas px-4 py-3 md:hidden">
        <span className="font-heading text-lg font-black tracking-tight text-ink">
          InvestTrack
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu />
        </Button>
      </div>

      <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DialogContent className="top-0 left-0 h-screen w-full max-w-[280px] translate-x-0 translate-y-0 gap-0 rounded-none p-0 sm:max-w-[280px]">
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
          <SidebarNav onNavigate={() => setIsDrawerOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex-1">{children}</div>
    </div>
  )
}

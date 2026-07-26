"use client"

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SidebarNav } from "@/features/app-shell/sidebar-nav"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div data-app-shell className="flex min-h-screen flex-col md:flex-row">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-canvas-soft transition-all duration-300 md:sticky md:top-0 md:flex md:h-screen",
          isCollapsed ? "md:w-[72px]" : "md:w-[264px]"
        )}
      >
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <span className="font-heading text-lg font-semibold text-ink">
              InvestTrack
            </span>
          )}
          <button
            type="button"
            aria-label={isCollapsed ? "Expandir menu" : "Colapsar menu"}
            onClick={() => setIsCollapsed((value) => !value)}
            className="flex size-8 items-center justify-center rounded-sm text-body hover:bg-canvas hover:text-ink"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav isCollapsed={isCollapsed} />
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-border bg-canvas px-4 py-3 md:hidden">
        <span className="font-heading text-lg font-semibold text-ink">
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
        <DialogContent
          className="top-0 left-0 h-screen w-full max-w-[280px] translate-x-0 translate-y-0 gap-0 rounded-none p-0 sm:max-w-[280px]"
          overlayClassName="bg-black/50"
        >
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
          <SidebarNav onNavigate={() => setIsDrawerOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex-1">{children}</div>
    </div>
  )
}

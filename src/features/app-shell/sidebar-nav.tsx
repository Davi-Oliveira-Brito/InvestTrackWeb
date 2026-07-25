"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-provider"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/carteira", label: "Minha Carteira" },
  { href: "/metricas", label: "Métricas" },
  { href: "/simulador", label: "Simulador" },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { email, nome, logout } = useAuth()

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "rounded-md border-l-4 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary-pale text-ink"
                  : "border-transparent text-body hover:bg-canvas-soft hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        <span className="truncate text-sm text-body">{nome ?? email}</span>
        <Button variant="outline" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>
    </div>
  )
}

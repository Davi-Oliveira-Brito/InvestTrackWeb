"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calculator,
  History,
  LayoutDashboard,
  LineChart,
  MoreVertical,
  Settings,
  Wallet,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/auth-provider"
import { cn } from "@/lib/utils"
import { getPerfil } from "@/services/perfil-service"
import type { PerfilResponse } from "@/types/perfil"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/carteira", label: "Minha Carteira", icon: Wallet },
  { href: "/metricas", label: "Métricas", icon: LineChart },
  { href: "/simulador", label: "Simulador", icon: Calculator },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

interface SidebarNavProps {
  isCollapsed?: boolean
  onNavigate?: () => void
}

function initials(value: string): string {
  return value.slice(0, 2).toUpperCase()
}

export function SidebarNav({ isCollapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { token, email, nome, logout } = useAuth()

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)

  const fetchPerfil = useCallback(async () => {
    if (!token) return
    const result = await getPerfil(token)
    if (result.ok) setPerfil(result.data)
  }, [token])

  // Refaz a busca a cada troca de rota — a sidebar não é remontada entre
  // navegações, então isso é o que sincroniza o avatar/nome após uma edição
  // feita em /perfil, sem precisar de um contexto compartilhado.
  useEffect(() => {
    fetchPerfil()
  }, [fetchPerfil, pathname])

  const displayName = perfil?.nome ?? nome ?? email ?? ""

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (isCollapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-label={item.label}
                className={cn(
                  "flex size-10 items-center justify-center rounded-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-body hover:bg-canvas-soft hover:text-ink"
                )}
              >
                <Icon className="size-5" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 text-sm font-normal transition-colors",
                isActive
                  ? "h-10 bg-primary text-primary-foreground"
                  : "h-9 text-body hover:bg-canvas-soft hover:text-ink"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-border p-4">
        <Link
          href="/perfil"
          onClick={onNavigate}
          className="flex flex-1 items-center gap-2 rounded-sm p-1 -m-1 transition-colors hover:bg-canvas-soft"
        >
          <Avatar>
            {perfil?.fotoUrl && <AvatarImage src={perfil.fotoUrl} alt={displayName} />}
            <AvatarFallback>{initials(displayName || "?")}</AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <span className="flex-1 truncate text-sm text-body">{displayName}</span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu do usuário"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-body hover:bg-canvas-soft hover:text-ink"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end">
            <DropdownMenuItem variant="destructive" onClick={logout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

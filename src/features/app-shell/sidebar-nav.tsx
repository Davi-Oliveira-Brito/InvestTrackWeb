"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calculator,
  LayoutDashboard,
  LineChart,
  MoreVertical,
  User,
  Wallet,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/auth-provider"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/carteira", label: "Minha Carteira", icon: Wallet },
  { href: "/metricas", label: "Métricas", icon: LineChart },
  { href: "/simulador", label: "Simulador", icon: Calculator },
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
  const { email, nome, logout } = useAuth()

  const displayName = nome ?? email ?? ""

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
                    ? "bg-primary text-ink"
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
                  ? "h-10 bg-primary text-ink"
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
        <Avatar>
          <AvatarFallback>{initials(displayName || "?")}</AvatarFallback>
        </Avatar>

        {!isCollapsed && (
          <span className="flex-1 truncate text-sm text-body">{displayName}</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu do usuário"
                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-body hover:bg-canvas-soft hover:text-ink"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end">
            <DropdownMenuItem>
              <User className="size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={logout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

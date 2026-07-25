# Sidebar Shell (CRM-style Nav) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-page nav/logout duplication with a shared CRM-style sidebar (desktop: fixed column; mobile: hamburger + drawer), per `docs/superpowers/specs/2026-07-25-sidebar-shell-design.md`.

**Architecture:** The 4 authenticated pages move into a `src/app/(app)/` route group with one shared `layout.tsx` (`ProtectedRoute` + `AppShell`). `AppShell` renders a fixed desktop sidebar and, below `md`, a hamburger button that opens the same nav inside the project's existing `Dialog` primitive repositioned as a left-side drawer. Session identity (`email`/`nome`) is added to `Session`/`AuthProvider` since the API never returns a profile — the login/registro forms already collect these values, they just weren't being persisted.

**Tech Stack:** Next.js 16.2.11 (App Router, route groups), React 19, TypeScript, Tailwind CSS v4, `@base-ui/react` (existing `Dialog`), `lucide-react` (existing dependency, `Menu` icon).

---

## File Structure

```
src/
  lib/
    auth-storage.ts                      [MODIFY] add email/nome to Session
  features/
    auth/
      auth-provider.tsx                  [MODIFY] expose email/nome
    app-shell/
      sidebar-nav.tsx                    [CREATE] nav list + active state + user footer
      app-shell.tsx                      [CREATE] desktop column + mobile hamburger/drawer
  app/
    (auth)/
      login/page.tsx                     [MODIFY] pass email into setSession
      registro/page.tsx                  [MODIFY] pass email+nome into setSession
    (app)/                                [CREATE — new route group]
      layout.tsx                         [CREATE] ProtectedRoute + AppShell
      dashboard/                          [MOVE from src/app/dashboard/]
        page.tsx                         [MODIFY] remove nav/logout header block
      carteira/                           [MOVE from src/app/carteira/, unchanged]
      metricas/                           [MOVE from src/app/metricas/, unchanged]
      simulador/                          [MOVE from src/app/simulador/, unchanged]
    dashboard/layout.tsx                  [DELETE]
    carteira/layout.tsx                   [DELETE]
    metricas/layout.tsx                   [DELETE]
    simulador/layout.tsx                  [DELETE]
```

---

### Task 1: `Session` gains `email`/`nome`

**Files:**
- Modify: `src/lib/auth-storage.ts`

- [ ] **Step 1: Rewrite the file**

```ts
const TOKEN_KEY = "investtrack:token"
const EXPIRES_KEY = "investtrack:expiraEm"
const EMAIL_KEY = "investtrack:email"
const NOME_KEY = "investtrack:nome"

export interface Session {
  token: string
  expiraEm: string
  email: string
  nome?: string
}

export function saveSession(session: Session): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(EXPIRES_KEY, session.expiraEm)
  localStorage.setItem(EMAIL_KEY, session.email)
  if (session.nome) {
    localStorage.setItem(NOME_KEY, session.nome)
  } else {
    localStorage.removeItem(NOME_KEY)
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(NOME_KEY)
}

export function getSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiraEm = localStorage.getItem(EXPIRES_KEY)
  const email = localStorage.getItem(EMAIL_KEY)

  if (!token || !expiraEm || !email) return null

  if (new Date(expiraEm).getTime() <= Date.now()) {
    clearSession()
    return null
  }

  return { token, expiraEm, email, nome: localStorage.getItem(NOME_KEY) ?? undefined }
}
```

(A session saved before this change has no `email` key — `getSession` now treats that as invalid, same as it already does for a missing token/expiraEm, forcing a fresh login. Not a real regression: no production users exist yet.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors in `src/features/auth/auth-provider.tsx` and the login/registro pages (they construct `Session`/call `login()` with the old shape) — expected until Tasks 2–3 fix them. Move on to Task 2 before committing.

- [ ] **Step 3: Commit together with Tasks 2 and 3**

(No separate commit here — `auth-storage.ts` alone would leave every existing call site broken. Commit happens at the end of Task 3.)

---

### Task 2: `AuthProvider` exposes `email`/`nome`

**Files:**
- Modify: `src/features/auth/auth-provider.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

import { clearSession, getSession, saveSession, type Session } from "@/lib/auth-storage"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  token: string | null
  email: string | null
  nome: string | null
  login: (session: Session) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [nome, setNome] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setToken(session.token)
      setEmail(session.email)
      setNome(session.nome ?? null)
      setStatus("authenticated")
    } else {
      setStatus("unauthenticated")
    }
  }, [])

  const login = useCallback((session: Session) => {
    saveSession(session)
    setToken(session.token)
    setEmail(session.email)
    setNome(session.nome ?? null)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setEmail(null)
    setNome(null)
    setStatus("unauthenticated")
  }, [])

  return (
    <AuthContext.Provider value={{ status, token, email, nome, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors remaining only in `src/app/(auth)/login/page.tsx` and `src/app/(auth)/registro/page.tsx` (still calling `setSession(result.data)` with the old 2-field shape) — fixed in Task 3.

---

### Task 3: Login/Registro pass identity into the session

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/registro/page.tsx`

- [ ] **Step 1: Update the login page**

In `src/app/(auth)/login/page.tsx`, change:

```tsx
    setSession(result.data)
    router.push("/dashboard")
```

to:

```tsx
    setSession({ ...result.data, email })
    router.push("/dashboard")
```

(`email` is already a `useState` in this file — no new state needed.)

- [ ] **Step 2: Update the registro page**

In `src/app/(auth)/registro/page.tsx`, change:

```tsx
    setSession(result.data)
    router.push("/dashboard")
```

to:

```tsx
    setSession({ ...result.data, email, nome })
    router.push("/dashboard")
```

(`email` and `nome` are already `useState` in this file.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (this resolves the errors introduced by Tasks 1–2).

- [ ] **Step 4: Commit Tasks 1–3 together**

```bash
git add src/lib/auth-storage.ts src/features/auth/auth-provider.tsx "src/app/(auth)/login/page.tsx" "src/app/(auth)/registro/page.tsx"
git commit -m "feat: persist email/nome in session for sidebar identity"
```

---

### Task 4: `SidebarNav` component

**Files:**
- Create: `src/features/app-shell/sidebar-nav.tsx`

- [ ] **Step 1: Write the file**

```tsx
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
```

Context: `cn` (`src/lib/utils.ts`), `Button` (`src/components/ui/button.tsx`), and `useAuth` (`src/features/auth/auth-provider.tsx`, updated in Task 2 to expose `email`/`nome`) all already exist. `border-primary`, `bg-primary-pale`, `border-border`, `text-body`, `bg-canvas-soft` are existing design tokens already used elsewhere in this codebase (e.g. `src/components/ui/input.tsx` uses `border-border`).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/app-shell/sidebar-nav.tsx
git commit -m "feat: add SidebarNav component with active-route indicator"
```

---

### Task 5: `AppShell` component

**Files:**
- Create: `src/features/app-shell/app-shell.tsx`

- [ ] **Step 1: Write the file**

```tsx
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
```

Context: `Dialog`/`DialogContent`/`DialogTitle` already exist (`src/components/ui/dialog.tsx`) and are already used by `src/features/carteira/posicao-form-dialog.tsx`. `DialogContent` accepts a `className` that's merged via `cn`/`tailwind-merge` on top of its default centered-modal classes, so passing `top-0 left-0 h-screen ... translate-x-0 translate-y-0 ... rounded-none` overrides the default `top-1/2 left-1/2 ... -translate-x-1/2 -translate-y-1/2 ... rounded-xl` positioning (same-utility-group conflicts resolve to the last class, which is this override) — turning the centered modal into a left-side drawer without touching `dialog.tsx` itself. `Menu` is a `lucide-react` icon (already a project dependency). The `DialogTitle` is visually hidden (`sr-only`) since the drawer's own nav content is the visible title-equivalent — it exists only so screen readers announce the dialog has a name.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/app-shell/app-shell.tsx
git commit -m "feat: add AppShell with desktop sidebar and mobile drawer"
```

---

### Task 6: `(app)` route group layout

**Files:**
- Create: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { ProtectedRoute } from "@/features/auth/protected-route"
import { AppShell } from "@/features/app-shell/app-shell"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (The 4 pages haven't moved into `(app)/` yet, so this layout doesn't wrap anything until Tasks 7–10 — that's fine, Next.js allows an empty route group.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "feat: add (app) route group layout with sidebar shell"
```

---

### Task 7: Migrate `/dashboard` into `(app)/` and remove its nav header

**Files:**
- Move: `src/app/dashboard/page.tsx` → `src/app/(app)/dashboard/page.tsx` (modified — see Step 2)
- Delete: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Move the folder**

```bash
git mv src/app/dashboard "src/app/(app)/dashboard"
```

- [ ] **Step 2: Delete the old layout and simplify the page header**

Delete `src/app/(app)/dashboard/layout.tsx` (it only wrapped `ProtectedRoute`, which the `(app)` group layout from Task 6 now provides):

```bash
git rm "src/app/(app)/dashboard/layout.tsx"
```

Replace `src/app/(app)/dashboard/page.tsx` in full with (removes the nav/logout header block and the now-unused `logout` destructure; everything else is unchanged):

```tsx
"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormAlert } from "@/components/ui/form-alert"
import { useAuth } from "@/features/auth/auth-provider"
import { aggregateByTipo } from "@/features/dashboard/aggregate-by-tipo"
import { AllocationPieChart } from "@/features/dashboard/allocation-pie-chart"
import { ResumoCards } from "@/features/dashboard/resumo-cards"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { getResumo, listPosicoes } from "@/services/carteira-service"
import type { PosicaoResponse, ResumoResponse } from "@/types/carteira"

export default function DashboardPage() {
  const { token } = useAuth()

  const [resumo, setResumo] = useState<ResumoResponse | null>(null)
  const [posicoes, setPosicoes] = useState<PosicaoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setLoadError(null)

    const [resumoResult, posicoesResult] = await Promise.all([
      getResumo(token),
      listPosicoes(token),
    ])

    setIsLoading(false)

    if (!resumoResult.ok) {
      setLoadError(getApiErrorMessage(resumoResult.error))
      return
    }
    if (!posicoesResult.ok) {
      setLoadError(getApiErrorMessage(posicoesResult.error))
      return
    }

    setResumo(resumoResult.data)
    setPosicoes(posicoesResult.data)
  }, [token])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (!token) return null

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Dashboard
        </h1>

        {isLoading && <p className="text-body">Carregando...</p>}

        {!isLoading && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchDashboard}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes === 0 && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button render={<Link href="/carteira">Adicionar posição</Link>} nativeButton={false} />
          </Card>
        )}

        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ResumoCards resumo={resumo} />
            <Card className="flex items-center justify-center">
              <AllocationPieChart alocacao={aggregateByTipo(posicoes)} />
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/dashboard"
git commit -m "refactor: move dashboard into (app) group, drop its nav header"
```

(`git mv`/`git rm` already staged the move and the layout deletion; this `git add` only needs to pick up the Step 2 content rewrite of the moved `page.tsx`.)

---

### Task 8: Migrate `/carteira` into `(app)/`

**Files:**
- Move: `src/app/carteira/page.tsx` → `src/app/(app)/carteira/page.tsx` (unchanged content — this page's header button is a page action, "Adicionar posição", not nav/logout, so it stays)
- Delete: `src/app/carteira/layout.tsx`

- [ ] **Step 1: Move the folder and delete its layout**

```bash
git mv src/app/carteira "src/app/(app)/carteira"
git rm "src/app/(app)/carteira/layout.tsx"
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/carteira"
git commit -m "refactor: move carteira into (app) route group"
```

---

### Task 9: Migrate `/metricas` into `(app)/`

**Files:**
- Move: `src/app/metricas/page.tsx` → `src/app/(app)/metricas/page.tsx` (unchanged — this page never had a nav header)
- Delete: `src/app/metricas/layout.tsx`

- [ ] **Step 1: Move the folder and delete its layout**

```bash
git mv src/app/metricas "src/app/(app)/metricas"
git rm "src/app/(app)/metricas/layout.tsx"
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/metricas"
git commit -m "refactor: move metricas into (app) route group"
```

---

### Task 10: Migrate `/simulador` into `(app)/`

**Files:**
- Move: `src/app/simulador/page.tsx` → `src/app/(app)/simulador/page.tsx` (unchanged — this page never had a nav header)
- Delete: `src/app/simulador/layout.tsx`

- [ ] **Step 1: Move the folder and delete its layout**

```bash
git mv src/app/simulador "src/app/(app)/simulador"
git rm "src/app/(app)/simulador/layout.tsx"
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/simulador"
git commit -m "refactor: move simulador into (app) route group"
```

---

### Task 11: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Lint the touched/created files directly**

Run: `npx eslint src/lib/auth-storage.ts src/features/auth/auth-provider.tsx "src/app/(auth)/login/page.tsx" "src/app/(auth)/registro/page.tsx" src/features/app-shell/sidebar-nav.tsx src/features/app-shell/app-shell.tsx "src/app/(app)/layout.tsx" "src/app/(app)/dashboard/page.tsx" "src/app/(app)/carteira/page.tsx" "src/app/(app)/metricas/page.tsx" "src/app/(app)/simulador/page.tsx"`

Expected: no errors, except the already-known `react-hooks/set-state-in-effect` finding on `(app)/dashboard/page.tsx`, `(app)/metricas/page.tsx`, and `(app)/carteira/page.tsx`'s mount-fetch `useEffect`s — pre-existing, tracked as its own Sprint 5 backlog item, not something to fix here. If any *other* rule fires, fix it before continuing.

(Don't run plain `npm run lint` — it also walks a stray worktree at `.claude/worktrees/tingly-twirling-acorn/.next/build/` that floods the output with unrelated errors.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds, and the route list shows `/dashboard`, `/carteira`, `/metricas`, `/simulador` unchanged (the `(app)` group doesn't affect the URL — confirm none of them show up prefixed or missing).

- [ ] **Step 3: Manual browser check (done by the user, not the agent)**

Tell the user to run `npm run dev` (port 3000 — CORS) and check, logged in:
1. Desktop width: sidebar visible as a fixed left column with 4 links + user email/nome + "Sair" at the bottom; the current page's link is visually indicated (left border + pale background).
2. Click each of the 4 links — page content changes, sidebar stays in place, correct link highlights as active each time.
3. Click "Sair" from the sidebar — logged out, redirected to `/login`.
4. Narrow the browser (or use devtools responsive mode) below the `md` breakpoint (~768px) — fixed sidebar disappears, a top bar with a hamburger icon appears instead.
5. Click the hamburger — drawer opens from the left with the same nav + user footer; clicking a link inside it navigates AND closes the drawer; clicking outside the drawer or pressing Escape also closes it.
6. Log in fresh (new account or existing) and confirm the sidebar footer shows the right email/nome — for a brand-new registration, it should show the name typed in the registro form; for a plain login, it shows the email typed at login.

- [ ] **Step 4: Fix anything the user reports, then commit if needed**

If lint/build/manual check surface issues, fix them in the relevant file from Tasks 1–10 and commit as `fix: <description>`.

---

## Post-implementation (outside this plan)

Once Task 11 is confirmed working by the user, update `ROADMAP.md` on this branch:
- Mark the sidebar shell checkbox `[x]` under Sprint 5, and update the `react-hooks/set-state-in-effect` backlog line to list `/carteira` again under its new `(app)/carteira/page.tsx` path (no functional change to that finding, just confirming it survived the move).
- Leave the other 5 Sprint 5 items (loading states, responsividade, dark mode, README, the lint fix itself) untouched — each gets its own future spec/plan.

This is a docs-only change tracked separately from this implementation plan, not a coding task.

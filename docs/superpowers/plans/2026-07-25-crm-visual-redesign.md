# CRM Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **IMPORTANT — commit convention for this plan:** NEVER add a "Co-Authored-By: Claude" (or similar AI attribution) footer to any commit message in this plan. Every commit example below is the exact, complete message to use verbatim.

**Goal:** Apply the new oliva/limão design system (`DESIGN-SYSTEM.md`) and CRM structural patterns (`CRM.md`) to the entire logged-in area (`/dashboard`, `/carteira`, `/metricas`, `/simulador`), per `docs/superpowers/specs/2026-07-25-crm-visual-redesign-design.md`, without changing anything on the Home/login/registro pages.

**Architecture:** Colors and fonts are scoped via a `data-app-shell` attribute on `AppShell`'s root element plus a `[data-app-shell] { ... }` CSS override block in `globals.css` (same mechanism as the existing, unused `.dark` block) — every existing component that already uses semantic classes (`text-ink`, `bg-canvas-soft`, etc.) re-themes automatically. Button radius is scoped the same way, keyed off the `data-slot="button"` attribute the component already emits. New structural patterns (card-in-card, `<section>` with info tooltip, "resumo com linhas") are new `Card` variants and one new `Section` component — additive, not touching the `content` variant that login/registro's `Card` usage depends on.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, `@base-ui/react` (adding `menu`, `avatar`, `tooltip` — already a dependency, no `npm install` needed), `lucide-react` (already a dependency), Fustat + Inter Tight via `next/font/google` (confirmed available in this Next.js version's font catalog).

---

## File Structure

```
src/
  app/
    globals.css                                [MODIFY] add [data-app-shell] token block
    layout.tsx                                  [MODIFY] load Fustat + Inter Tight
    (app)/
      dashboard/page.tsx                        [MODIFY] Section wrap, simplify empty state
      metricas/page.tsx                         [MODIFY] Section wrap, simplify empty state
      carteira/page.tsx                         [MODIFY] drop Card wrapper around Table, simplify empty state
      simulador/page.tsx                        [MODIFY] Section wraps
  components/ui/
    dialog.tsx                                  [MODIFY] add optional overlayClassName prop
    card.tsx                                    [MODIFY] add metric-wrapper/metric-child/resumo-linhas variants
    select.tsx                                  [MODIFY] radius 8px, shadow-lg
    table.tsx                                   [MODIFY] container radius 4px + border, keep row hover
    tooltip.tsx                                 [CREATE]
    avatar.tsx                                  [CREATE]
    dropdown-menu.tsx                           [CREATE]
    section.tsx                                 [CREATE]
  features/
    app-shell/
      app-shell.tsx                             [MODIFY, rewrite] 2 states, 300ms transition, darker mobile overlay
      sidebar-nav.tsx                            [MODIFY, rewrite] icons, active bg-primary, collapsed chips, user footer dropdown
    dashboard/
      aggregate-by-tipo.ts                       [MODIFY] new chart colors
      resumo-cards.tsx                           [MODIFY] card-in-card restructure
    metricas/
      retorno-bar-chart.tsx                      [MODIFY] new chart colors
      metricas-stat-tiles.tsx                    [MODIFY] resumo-linhas restructure
    simulador/
      simulacao-result-card.tsx                  [MODIFY] drop own Card wrapper (parent now wraps in Section)
```

---

### Task 1: Scoped design tokens in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the `[data-app-shell]` block**

Insert this new block immediately after the `:root { ... }` block and before the `.dark { ... }` block:

```css
/* CRM redesign — scoped to the logged-in area only (AppShell sets data-app-shell). */
/* :root above keeps the Wise palette for Home/login/registro, untouched. */
[data-app-shell] {
  --canvas-soft: #F6F6F0;
  --ink: #1C1B10;
  --body: #807A47;
  --mute: #807A47;
  --positive: #22C55E;
  --negative: #EF4444;
  --primary: #EAE668;
  --primary-active: #D6D02E;
  --primary-pale: #F8F7D4;
  --border: #EDECDF;
  --ring: #EAE668;
  --font-heading: var(--font-fustat);
  --font-sans: var(--font-inter-tight);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (CSS-only change).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add scoped CRM design tokens for the logged-in area"
```

---

### Task 2: Load Fustat + Inter Tight

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add the font imports and variables**

Change the `next/font/google` import line from:

```ts
import { Geist, Geist_Mono, Inter } from "next/font/google";
```

to:

```ts
import { Fustat, Geist, Geist_Mono, Inter, Inter_Tight } from "next/font/google";
```

Add these two font loaders after the existing `inter` one:

```ts
const fustat = Fustat({
  variable: "--font-fustat",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});
```

Update the `<html>` element's `className` to include the two new variables (keep the existing ones — Geist/Inter still serve Home/login/registro):

```tsx
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${fustat.variable} ${interTight.variable} h-full antialiased`}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Build (font loading only fully validates at build time)**

Run: `npm run build`
Expected: build succeeds — this confirms Next.js can actually fetch/bundle the Fustat and Inter Tight font metadata (if either name were wrong, this is where it would fail, not `tsc`).

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: load Fustat and Inter Tight fonts for the CRM redesign"
```

---

### Task 3: `Dialog` gains an optional overlay className override

**Files:**
- Modify: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Thread an `overlayClassName` prop through `DialogContent`**

In `src/components/ui/dialog.tsx`, change the `DialogContent` function from:

```tsx
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
```

to:

```tsx
function DialogContent({
  className,
  overlayClassName,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  overlayClassName?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
```

(Everything else in the file — `DialogOverlay`'s own default classes, the rest of `DialogContent`, every other exported function — stays exactly as it is. `DialogOverlay` already accepts and merges a `className` via `cn()`, so passing `overlayClassName` through just reuses that existing merge behavior.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "feat: add optional overlayClassName prop to DialogContent"
```

---

### Task 4: `Tooltip` primitive

**Files:**
- Create: `src/components/ui/tooltip.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} align={align}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 max-w-xs rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }
```

Context: `@base-ui/react/tooltip` exports `Root`/`Trigger`/`Portal`/`Positioner`/`Popup` — same compound-component shape already used by `select.tsx`/`dialog.tsx` in this codebase. `bg-popover`/`text-popover-foreground`/`ring-foreground/10` are existing tokens already used by `select.tsx`'s `SelectContent`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/tooltip.tsx
git commit -m "feat: add Tooltip primitive"
```

---

### Task 5: `Avatar` primitive

**Files:**
- Create: `src/components/ui/avatar.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-canvas-soft",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("text-xs font-semibold text-ink", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback }
```

Context: no `AvatarImage` needed — this app has no profile photo URL anywhere (only `email`/`nome` strings from `useAuth()`), so only `Root` + `Fallback` (initials) are used.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/avatar.tsx
git commit -m "feat: add Avatar primitive"
```

---

### Task 6: `DropdownMenu` primitive

**Files:**
- Create: `src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger

function DropdownMenuContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "end",
  alignOffset = 0,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

interface DropdownMenuItemProps extends MenuPrimitive.Item.Props {
  variant?: "default" | "destructive"
}

function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-canvas-soft",
        variant === "destructive" ? "text-negative" : "text-ink",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
}
```

Context: `@base-ui/react/menu` exports `Root`/`Trigger`/`Portal`/`Positioner`/`Popup`/`Item` (confirmed by reading `node_modules/@base-ui/react/menu/index.parts.js`) — same shape as `select.tsx`'s `SelectContent`/`SelectItem`. `data-highlighted` is Base UI's equivalent of a hover/focus state on menu items (used the same way `data-disabled`/`data-open` are used elsewhere in this codebase's wrapped primitives).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/dropdown-menu.tsx
git commit -m "feat: add DropdownMenu primitive"
```

---

### Task 7: `Section` component

**Files:**
- Create: `src/components/ui/section.tsx`

- [ ] **Step 1: Write the file**

```tsx
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
```

Context: `rounded-md` in this project's Tailwind theme resolves to `--radius-md: 12px` (defined in `globals.css`'s `@theme inline` block) — matches CRM.md 4.2's "radius 12px" exactly. `border-border` picks up the new `#EDECDF` value once rendered inside `[data-app-shell]` (Task 1). `Tooltip`/`TooltipContent`/`TooltipTrigger` from Task 4.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/section.tsx
git commit -m "feat: add Section component for chart/content blocks"
```

---

### Task 8: `Card` gains metric-wrapper / metric-child / resumo-linhas variants

**Files:**
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Add the new variants**

Change the `cardVariants` definition from:

```ts
const cardVariants = cva("rounded-xl p-6", {
  variants: {
    variant: {
      content: "bg-card text-card-foreground",
      sage: "bg-canvas-soft text-ink",
      pale: "bg-primary-pale text-ink",
    },
  },
  defaultVariants: {
    variant: "content",
  },
})
```

to:

```ts
const cardVariants = cva("rounded-xl p-6", {
  variants: {
    variant: {
      content: "bg-card text-card-foreground",
      sage: "bg-canvas-soft text-ink",
      pale: "bg-primary-pale text-ink",
      "metric-wrapper": "rounded-lg bg-canvas-soft p-4",
      "metric-child": "rounded-lg bg-canvas p-4",
      "resumo-linhas": "rounded-lg border border-border bg-canvas p-5",
    },
  },
  defaultVariants: {
    variant: "content",
  },
})
```

(`content`/`sage`/`pale` — used by login/registro and elsewhere — are untouched. The final class string still goes through this file's `cn()` call, which uses `tailwind-merge`, so each new variant's `rounded-lg`/`p-4`/`p-5` correctly overrides the base `rounded-xl`/`p-6` — same override mechanism already verified working for `AppShell`'s Dialog repositioning in the Sprint 5 code review.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat: add metric-wrapper, metric-child, and resumo-linhas Card variants"
```

---

### Task 9: `Select` radius + shadow

**Files:**
- Modify: `src/components/ui/select.tsx`

- [ ] **Step 1: Update `SelectTrigger`'s radius**

In `SelectTrigger`'s className string, change `rounded-lg` to `rounded-sm` (this project's `--radius-sm` is 8px — matches CRM.md 6.2's "radius 8px" for the select trigger; the existing `rounded-lg` was 16px, from before this redesign).

Find:
```
"flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```

Replace the leading `rounded-lg` with `rounded-sm` (only that one occurrence — leave `data-[size=sm]:rounded-[min(var(--radius-md),10px)]` untouched, it's a different, smaller trigger size variant not covered by this redesign).

- [ ] **Step 2: Update `SelectContent`'s shadow**

In `SelectContent`'s className string, change `shadow-md` to `shadow-lg` (CRM.md 6.3 specifies a box-shadow value that corresponds to Tailwind's `shadow-lg` utility, not `shadow-md`).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/select.tsx
git commit -m "fix: select trigger radius to 8px and popup shadow to shadow-lg"
```

---

### Task 10: `Table` container radius + border

**Files:**
- Modify: `src/components/ui/table.tsx`

- [ ] **Step 1: Update the table container**

Change:

```tsx
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
```

to:

```tsx
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-[4px] border border-border bg-canvas"
    >
```

(CRM.md 7: "border-radius: 4px no container da tabela" — no named radius step matches 4px in this theme's scale, hence the arbitrary value. `TableRow`'s existing `hover:bg-muted/50` is untouched — it's interaction feedback, not the static zebra-striping CRM.md asks to avoid, and no zebra-striping exists in this file today to begin with.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/table.tsx
git commit -m "fix: table container radius to 4px with a border, keep row hover"
```

---

### Task 11: `SidebarNav` rewrite — icons, active state, collapsed chips, user footer

**Files:**
- Modify (full rewrite): `src/features/app-shell/sidebar-nav.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
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
```

Context: matches CRM.md 2.3 exactly — active item `bg-primary text-ink`, radius 8px (`rounded-sm` = this theme's `--radius-sm`), height 40px active (`h-10`) / 36px inactive (`h-9`), padding via `px-3` + fixed height (CRM.md's `8px 12px` padding is approximated by the fixed height + `px-3`, consistent with how the rest of this codebase's buttons express padding), gap 12px (`gap-3` = 0.75rem = 12px), collapsed chip 40×40 (`size-10`) radius 8px. `DropdownMenuContent side="top"` because the trigger sits at the bottom of the viewport (sidebar footer) — opening downward would go off-screen.

**Known, deliberate limitation:** "Perfil" has no `href`/`onClick` — there is no profile page anywhere in this app yet. It renders as an inert menu item for now (not disabled, just a no-op) rather than link to a page that doesn't exist. Flag this to the user after Task 21's manual check in case they want a real destination later.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/app-shell/sidebar-nav.tsx
git commit -m "feat: redesign SidebarNav with icons, CRM active state, and user dropdown"
```

---

### Task 12: `AppShell` rewrite — two states, 300ms transition, scoped tokens, darker mobile overlay

**Files:**
- Modify (full rewrite): `src/features/app-shell/app-shell.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
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
```

Context: `data-app-shell` is what Task 1's CSS block targets. `transition-all duration-300` matches CRM.md 2.1 exactly. `overlayClassName="bg-black/50"` (added in Task 3) darkens only this drawer's backdrop — the modals in `posicao-form-dialog.tsx`/`delete-posicao-dialog.tsx` don't pass this prop, so they keep the existing lighter default. `cn` import added since the `<aside>` className is now conditional.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/app-shell/app-shell.tsx
git commit -m "feat: add expand/collapse states to AppShell sidebar"
```

---

### Task 13: New chart colors — `aggregate-by-tipo.ts`

**Files:**
- Modify: `src/features/dashboard/aggregate-by-tipo.ts`

- [ ] **Step 1: Update `CORES_POR_TIPO`**

Change:

```ts
const CORES_POR_TIPO: Record<TipoAtivo, string> = {
  Acao: "#2a78d6",
  FII: "#eb6834",
  RendaFixa: "#1baf7a",
}
```

to:

```ts
const CORES_POR_TIPO: Record<TipoAtivo, string> = {
  Acao: "#3B82F6",
  FII: "#A855F7",
  RendaFixa: "#14B8A6",
}
```

(Azul/roxo/teal from the new `DESIGN-SYSTEM.md` support-color palette — per the spec's decision 4, green/red from that same 6-color set are reserved for gain/loss, not used as categorical identity here.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/aggregate-by-tipo.ts
git commit -m "fix: use new DESIGN-SYSTEM support colors for allocation pie chart"
```

---

### Task 14: New chart colors — `retorno-bar-chart.tsx` call site

**Files:**
- Modify: `src/app/(app)/metricas/page.tsx`

- [ ] **Step 1: Update the inline colors in `itensRetorno`**

Change:

```tsx
  const itensRetorno: RetornoBarItem[] = metricas
    ? [
        {
          label: "Carteira",
          value: toNumber(metricas.retornoAnualizadoCarteira),
          color: "#2a78d6",
        },
        {
          label: "CDI",
          value: toNumber(metricas.retornoAnualizadoCdi),
          color: "#eb6834",
        },
        {
          label: "Ibovespa",
          value:
            metricas.retornoAnualizadoIbovespa === null
              ? null
              : toNumber(metricas.retornoAnualizadoIbovespa),
          color: "#1baf7a",
        },
      ]
    : []
```

to:

```tsx
  const itensRetorno: RetornoBarItem[] = metricas
    ? [
        {
          label: "Carteira",
          value: toNumber(metricas.retornoAnualizadoCarteira),
          color: "#3B82F6",
        },
        {
          label: "CDI",
          value: toNumber(metricas.retornoAnualizadoCdi),
          color: "#A855F7",
        },
        {
          label: "Ibovespa",
          value:
            metricas.retornoAnualizadoIbovespa === null
              ? null
              : toNumber(metricas.retornoAnualizadoIbovespa),
          color: "#14B8A6",
        },
      ]
    : []
```

(Same azul/roxo/teal trio as Task 13 — per the spec, these two charts never appear side by side, so reusing the same 3 colors is intentional, not an oversight.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/metricas/page.tsx"
git commit -m "fix: use new DESIGN-SYSTEM support colors for retorno bar chart"
```

---

### Task 15: `ResumoCards` card-in-card restructure

**Files:**
- Modify (full rewrite): `src/features/dashboard/resumo-cards.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
import { Card } from "@/components/ui/card"
import { formatCurrencyBRL, formatPercent, toNumber } from "@/lib/format"
import type { ResumoResponse } from "@/types/carteira"

interface ResumoCardsProps {
  resumo: ResumoResponse
}

export function ResumoCards({ resumo }: ResumoCardsProps) {
  const rentabilidadeConhecida =
    resumo.rentabilidadeTotalValor !== null &&
    resumo.rentabilidadeTotalPercentual !== null

  const rentabilidadeColor =
    rentabilidadeConhecida && toNumber(resumo.rentabilidadeTotalValor!) >= 0
      ? "text-positive"
      : "text-negative"

  return (
    <Card variant="metric-wrapper" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor Investido</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resumo.valorTotalInvestido)}
        </span>
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor Atual</span>
        <span className="text-2xl font-semibold text-ink">
          {resumo.valorTotalAtual === null
            ? "Cotação pendente"
            : formatCurrencyBRL(resumo.valorTotalAtual)}
        </span>
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Rentabilidade</span>
        {rentabilidadeConhecida ? (
          <span className={`text-2xl font-semibold ${rentabilidadeColor}`}>
            {formatCurrencyBRL(resumo.rentabilidadeTotalValor!)} (
            {formatPercent(resumo.rentabilidadeTotalPercentual!)})
          </span>
        ) : (
          <span className="text-2xl font-semibold text-mute">Cotação pendente</span>
        )}
      </Card>

      <Card variant="metric-child" className="flex flex-col gap-1">
        <span className="text-sm text-mute">Posições</span>
        <span className="text-2xl font-semibold text-ink">
          {resumo.quantidadePosicoes}
        </span>
        {resumo.quantidadePosicoesSemCotacao > 0 && (
          <span className="text-xs text-mute">
            {resumo.quantidadePosicoesSemCotacao} aguardando cotação
          </span>
        )}
      </Card>
    </Card>
  )
}
```

(Only the wrapping changed — from a plain `flex flex-col` of 4 loose `Card`s to a `metric-wrapper` Card containing 4 `metric-child` Cards in a responsive grid. All labels/values/logic are byte-identical to before. CRM.md's illustration shows 3 children; this keeps the 4 metrics already shown today rather than dropping one just to match the example's count — same reasoning already applied to the sidebar keeping 4 nav items.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/resumo-cards.tsx
git commit -m "feat: restructure ResumoCards into card-in-card pattern"
```

---

### Task 16: Dashboard page — Section wrap + minimalist empty state

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Add the `Section` import**

Add to the imports (alphabetically among the `@/components/ui/*` imports):

```tsx
import { Section } from "@/components/ui/section"
```

- [ ] **Step 2: Simplify the empty state**

Change:

```tsx
        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes === 0 && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button render={<Link href="/carteira">Adicionar posição</Link>} nativeButton={false} />
          </Card>
        )}
```

to:

```tsx
        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button render={<Link href="/carteira">Adicionar posição</Link>} nativeButton={false} />
          </div>
        )}
```

(CRM.md 7's empty-state guidance — "texto centralizado, cinza, simples... sem ilustração, minimalista" — applies the same way here as it does to the carteira table's empty state: no card chrome, just centered text + action. `Card` import in this file stays, since the loading/error/success branches elsewhere in the same file don't use it directly but nothing else needs removing.)

- [ ] **Step 3: Wrap the pie chart in `Section`**

Change:

```tsx
        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ResumoCards resumo={resumo} />
            <Card className="flex items-center justify-center">
              <AllocationPieChart alocacao={aggregateByTipo(posicoes)} />
            </Card>
          </div>
        )}
```

to:

```tsx
        {!isLoading && !loadError && resumo && resumo.quantidadePosicoes > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ResumoCards resumo={resumo} />
            <Section title="Alocação por classe de ativo">
              <div className="flex items-center justify-center">
                <AllocationPieChart alocacao={aggregateByTipo(posicoes)} />
              </div>
            </Section>
          </div>
        )}
```

- [ ] **Step 4: Remove the now-unused `Card` import**

After steps 2–3, nothing in this file renders `<Card` anymore (the empty state and the pie-chart wrapper were the only two usages). Remove `Card` from the `@/components/ui/card` import — if that import line has no other named imports, remove the whole line.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors, and no "unused import" lint warning for `Card`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/dashboard/page.tsx"
git commit -m "feat: wrap dashboard pie chart in Section, simplify empty state"
```

---

### Task 17: `MetricasStatTiles` resumo-linhas restructure

**Files:**
- Modify (full rewrite): `src/features/metricas/metricas-stat-tiles.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
import { Info } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPercent, toNumber } from "@/lib/format"
import type { MetricasResponse } from "@/types/carteira"

interface MetricasStatTilesProps {
  metricas: MetricasResponse
}

interface LinhaResumoProps {
  label: string
  valor: string
  info: string
}

function LinhaResumo({ label, valor, info }: LinhaResumoProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-mute">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-ink">{valor}</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`Sobre ${label}`}
                className="flex size-5 items-center justify-center rounded-full text-mute hover:text-ink"
              />
            }
          >
            <Info className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{info}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export function MetricasStatTiles({ metricas }: MetricasStatTilesProps) {
  return (
    <div className="flex flex-col gap-2">
      <Card variant="resumo-linhas" className="flex flex-col divide-y divide-border">
        <LinhaResumo
          label="Volatilidade Anualizada"
          valor={formatPercent(metricas.volatilidadeAnualizada)}
          info="Mede o quanto o retorno da carteira varia ao longo do tempo."
        />
        <LinhaResumo
          label="Sharpe Ratio"
          valor={toNumber(metricas.sharpeRatio).toFixed(2)}
          info="Retorno ajustado ao risco: quanto maior, melhor a relação entre retorno e volatilidade."
        />
        <LinhaResumo
          label="Drawdown Máximo"
          valor={formatPercent(metricas.drawdownMaximo)}
          info="A maior queda registrada do valor da carteira em relação ao seu pico anterior."
        />
      </Card>
      <p className="text-xs text-mute">
        Baseado em {toNumber(metricas.diasConsiderados)} dias de histórico.
      </p>
    </div>
  )
}
```

(Matches CRM.md 4.3 exactly: label + big value + info icon per row, rows separated by a thin divider (`divide-y divide-border`), border+radius 16px+padding 20px via the `resumo-linhas` Card variant from Task 8.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/metricas/metricas-stat-tiles.tsx
git commit -m "feat: restructure MetricasStatTiles into resumo-linhas pattern"
```

---

### Task 18: Métricas page — Section wrap + minimalist empty state

**Files:**
- Modify: `src/app/(app)/metricas/page.tsx`

- [ ] **Step 1: Add the `Section` import**

```tsx
import { Section } from "@/components/ui/section"
```

- [ ] **Step 2: Simplify the empty state**

Change:

```tsx
        {!isLoading && isEmpty && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button
              render={<Link href="/carteira">Adicionar posição</Link>}
              nativeButton={false}
            />
          </Card>
        )}
```

to:

```tsx
        {!isLoading && isEmpty && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button
              render={<Link href="/carteira">Adicionar posição</Link>}
              nativeButton={false}
            />
          </div>
        )}
```

- [ ] **Step 3: Wrap the bar chart in `Section`**

Change:

```tsx
        {!isLoading && !isEmpty && !loadError && metricas && (
          <div className="flex flex-col gap-6">
            <Card>
              <RetornoBarChart itens={itensRetorno} />
            </Card>
            <MetricasStatTiles metricas={metricas} />
          </div>
        )}
```

to:

```tsx
        {!isLoading && !isEmpty && !loadError && metricas && (
          <div className="flex flex-col gap-6">
            <Section title="Carteira vs. CDI vs. Ibovespa">
              <RetornoBarChart itens={itensRetorno} />
            </Section>
            <MetricasStatTiles metricas={metricas} />
          </div>
        )}
```

- [ ] **Step 4: Remove the now-unused `Card` import**

After steps 2–3, nothing in this file renders `<Card` anymore. Remove `Card` from the `@/components/ui/card` import — if that import line has no other named imports, remove the whole line.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors, and no "unused import" lint warning for `Card`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/metricas/page.tsx"
git commit -m "feat: wrap metricas bar chart in Section, simplify empty state"
```

---

### Task 19: Carteira page — drop Card wrapper around Table, simplify empty state

**Files:**
- Modify: `src/app/(app)/carteira/page.tsx`

- [ ] **Step 1: Simplify the empty state**

Change:

```tsx
        {!isLoading && !loadError && posicoes.length === 0 && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button onClick={openCreateDialog}>Adicionar primeira posição</Button>
          </Card>
        )}
```

to:

```tsx
        {!isLoading && !loadError && posicoes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button onClick={openCreateDialog}>Adicionar primeira posição</Button>
          </div>
        )}
```

- [ ] **Step 2: Drop the `Card` wrapper around the table**

Change:

```tsx
        {!isLoading && !loadError && posicoes.length > 0 && (
          <Card className="p-0">
            <Table>
```

to:

```tsx
        {!isLoading && !loadError && posicoes.length > 0 && (
          <>
            <Table>
```

...and its matching closing tag, change:

```tsx
            </Table>
          </Card>
        )}
```

to:

```tsx
            </Table>
          </>
        )}
```

(`Table`'s own container — updated in Task 10 — now supplies the border/radius/background itself, so wrapping it in a separate white `Card` on top would double the chrome.)

- [ ] **Step 3: Remove the now-unused `Card` import**

After steps 1–2, nothing in this file renders `<Card` anymore. Remove `Card` from the `@/components/ui/card` import — if that import line has no other named imports, remove the whole line.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors, and no "unused import" lint warning for `Card`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/carteira/page.tsx"
git commit -m "feat: drop redundant Card wrapper around carteira table, simplify empty state"
```

---

### Task 20: Simulador — `Section` wraps, drop `SimulacaoResultCard`'s own Card

**Files:**
- Modify: `src/features/simulador/simulacao-result-card.tsx`
- Modify: `src/app/(app)/simulador/page.tsx`

- [ ] **Step 1: Strip the `Card` wrapper from `SimulacaoResultCard`**

Change:

```tsx
import { Card } from "@/components/ui/card"
import { formatCurrencyBRL, formatDateBR, formatPercent, toNumber } from "@/lib/format"
import type { SimulacaoResponse } from "@/types/simulacao"

interface SimulacaoResultCardProps {
  resultado: SimulacaoResponse
}

export function SimulacaoResultCard({ resultado }: SimulacaoResultCardProps) {
  const rentabilidadeColor =
    toNumber(resultado.rentabilidadeValor) >= 0 ? "text-positive" : "text-negative"

  return (
    <Card className="flex flex-col gap-4">
```

to:

```tsx
import { formatCurrencyBRL, formatDateBR, formatPercent, toNumber } from "@/lib/format"
import type { SimulacaoResponse } from "@/types/simulacao"

interface SimulacaoResultCardProps {
  resultado: SimulacaoResponse
}

export function SimulacaoResultCard({ resultado }: SimulacaoResultCardProps) {
  const rentabilidadeColor =
    toNumber(resultado.rentabilidadeValor) >= 0 ? "text-positive" : "text-negative"

  return (
    <div className="flex flex-col gap-4">
```

...and its matching closing tag, change the file's final `</Card>` to `</div>`.

- [ ] **Step 2: Wrap the form and result in `Section` on the page**

In `src/app/(app)/simulador/page.tsx`, add the import:

```tsx
import { Section } from "@/components/ui/section"
```

Change:

```tsx
        <SimuladorForm token={token} onResult={setResultado} />

        {resultado && <SimulacaoResultCard resultado={resultado} />}
```

to:

```tsx
        <Section title="Simular investimento">
          <SimuladorForm token={token} onResult={setResultado} />
        </Section>

        {resultado && (
          <Section title="Resultado da simulação">
            <SimulacaoResultCard resultado={resultado} />
          </Section>
        )}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/simulador/simulacao-result-card.tsx "src/app/(app)/simulador/page.tsx"
git commit -m "feat: wrap simulador form and result in Section"
```

---

### Task 21: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Lint the touched/created files directly**

Run: `npx eslint src/app/globals.css src/app/layout.tsx src/components/ui/dialog.tsx src/components/ui/tooltip.tsx src/components/ui/avatar.tsx src/components/ui/dropdown-menu.tsx src/components/ui/section.tsx src/components/ui/card.tsx src/components/ui/select.tsx src/components/ui/table.tsx src/features/app-shell/sidebar-nav.tsx src/features/app-shell/app-shell.tsx src/features/dashboard/aggregate-by-tipo.ts src/features/dashboard/resumo-cards.tsx src/features/metricas/metricas-stat-tiles.tsx src/features/simulador/simulacao-result-card.tsx "src/app/(app)/dashboard/page.tsx" "src/app/(app)/metricas/page.tsx" "src/app/(app)/carteira/page.tsx" "src/app/(app)/simulador/page.tsx"`

Expected: no errors, except the already-known `react-hooks/set-state-in-effect` finding on `dashboard`/`carteira`/`metricas` pages and `auth-provider.tsx` (untouched by this plan) — pre-existing, tracked separately, not something to fix here. If any *other* rule fires, fix it before continuing.

(Don't run plain `npm run lint` — it also walks a stray worktree at `.claude/worktrees/tingly-twirling-acorn/.next/build/` that floods the output with unrelated errors.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds (this is also the real test that Fustat/Inter Tight resolve correctly — a bad font name fails at build time, not at `tsc`).

- [ ] **Step 3: Manual browser check (done by the user, not the agent)**

Tell the user to run `npm run dev` (port 3000 — CORS) and check, logged in:
1. **Home/login/registro**: open each one and confirm they look **exactly as before** — lime/sage Wise palette, pill buttons, Geist/Inter fonts. This is the most important check — if any of these changed, something leaked out of the `[data-app-shell]` scope.
2. **Sidebar desktop**: oliva/limão palette, Fustat headings, icons on each nav item, active item with solid lime background, collapse toggle animates the width over ~300ms, collapsed mode shows icon-only chips.
3. **Sidebar footer**: avatar with initials, name/email, "⋮" opens a dropdown (Perfil / Sair in red) above the trigger, "Sair" logs out.
4. **Mobile** (devtools responsive mode, below ~768px): top bar + hamburger, drawer opens from the left with a noticeably darker overlay than the carteira create/edit modal's overlay.
5. **Dashboard**: 4 metric cards inside a light-gray wrapper card, pizza chart inside a bordered `<section>` with a title, no shadow.
6. **Métricas**: bar chart inside a bordered `<section>` with a title, no shadow; the 3 risk stats (Volatilidade/Sharpe/Drawdown) as label+value+info-icon rows separated by thin dividers, each info icon's tooltip shows real explanatory text on hover.
7. **Carteira**: table with a thin border and small (4px) radius, no zebra-striping, hover still highlights the row under the cursor, "cotação pendente" shown as secondary-colored text (not a blank cell).
8. **Simulador**: form and result card each inside their own bordered `<section>`.
9. Buttons throughout the logged-in area are visibly square-ish (8px radius), not pill-shaped.

- [ ] **Step 4: Fix anything the user reports, then commit if needed**

If lint/build/manual check surface issues, fix them in the relevant file from Tasks 1–20 and commit as `fix: <description>` (no co-author footer, per this plan's header note).

---

## Post-implementation (outside this plan)

No `ROADMAP.md` exists anymore in this repository (removed by the user alongside this redesign) — there is no roadmap doc to update after this plan completes. If the user wants this redesign tracked somewhere, ask them where before inventing a new tracking file.

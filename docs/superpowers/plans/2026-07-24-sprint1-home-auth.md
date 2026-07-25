# Sprint 1 — Home + Autenticação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Home (landing) page and the Login/Registro flow against the InvestTrack API, with the JWT stored in `localStorage` and a working client-side route guard, per Sprint 1 of `ROADMAP.md`.

**Architecture:** A centralized `services/` HTTP client normalizes the API's two error shapes (`{errors}` validation / `{message}` business) plus `429` and `ProblemDetails`. Auth state lives in a client-side `AuthProvider` (React Context) that reads/writes `localStorage` — there is no server-side session, because the project's already-decided trade-off is `localStorage`, not an httpOnly cookie (see `ROADMAP.md` → "Decisões já tomadas"), and this Next.js version's `proxy.ts` (formerly `middleware.ts`) cannot read `localStorage`, so route protection happens in a client `layout.tsx` guard instead. Forms are plain Client Components with `useState` (no new form libraries — decided with the user). All UI is restyled with the token set from `DESIGN-SYSTEM.md` (Wise-inspired: lime CTA, sage canvas, ink text, 24px pill radius).

**Tech Stack:** Next.js 16.2.11 (App Router), React 19, TypeScript, Tailwind CSS v4, `@base-ui/react` primitives (this repo's shadcn style is `base-nova`, not Radix).

**Decisions confirmed with the user:**
- No automated test framework for Sprint 1 (none is installed; ROADMAP doesn't require it). Verification = `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks.
- Forms use plain `useState` + hand-written validators mirroring the API's rules — no `react-hook-form`/`zod`.

**Known risks / open questions (verify manually once the real API is reachable):**
- The exact casing of validation-error keys (`errors: { email: [...] }` vs `errors: { Email: [...] }`) isn't documented in `ROADMAP.md`. `pickError()` (Task 5) checks both `camelCase` and `PascalCase` keys defensively — confirm against the live API during Task 12 and simplify if only one casing ever appears.
- Dark mode is explicitly Sprint 5 scope; the existing `.dark` CSS block is left untouched (unused/unwired) rather than half-migrated.

---

## File Structure

```
src/
  app/
    layout.tsx                  [MODIFY] fonts + AuthProvider wrap
    page.tsx                    [MODIFY] Home hero
    globals.css                 [MODIFY] Wise design tokens
    (auth)/
      layout.tsx                [CREATE] centered card shell
      login/page.tsx             [CREATE]
      registro/page.tsx          [CREATE]
    dashboard/
      layout.tsx                 [CREATE] client-side auth guard
      page.tsx                   [CREATE] placeholder authenticated page
  components/ui/
    button.tsx                  [MODIFY] 24px radius + primary hover token
    input.tsx                   [CREATE]
    label.tsx                   [CREATE]
    field-error.tsx             [CREATE]
    form-alert.tsx              [CREATE]
    card.tsx                    [CREATE]
  features/auth/
    validation.ts               [CREATE] nome/email/senha validators
    auth-provider.tsx           [CREATE] context + useAuth()
  services/
    http-client.ts              [CREATE] fetch wrapper + error normalization
    auth-service.ts             [CREATE] login()/register()
  lib/
    auth-storage.ts             [CREATE] localStorage session helpers
    validation-errors.ts        [CREATE] pickError() + getApiErrorMessage()
  types/
    api.ts                      [CREATE] ApiResult/ApiError/ValidationErrors
```

---

### Task 1: Apply Wise design tokens to `globals.css` and wire the Inter font

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/globals.css` with the token-mapped version**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-geist-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);

  /* Wise-inspired tokens — see DESIGN-SYSTEM.md */
  --color-canvas: var(--canvas);
  --color-canvas-soft: var(--canvas-soft);
  --color-ink: var(--ink);
  --color-ink-deep: var(--ink-deep);
  --color-body: var(--body);
  --color-mute: var(--mute);
  --color-positive: var(--positive);
  --color-positive-deep: var(--positive-deep);
  --color-warning: var(--warning);
  --color-warning-deep: var(--warning-deep);
  --color-warning-content: var(--warning-content);
  --color-negative: var(--negative);
  --color-negative-deep: var(--negative-deep);
  --color-negative-darkest: var(--negative-darkest);
  --color-negative-bg: var(--negative-bg);
  --color-primary-active: var(--primary-active);
  --color-primary-neutral: var(--primary-neutral);
  --color-primary-pale: var(--primary-pale);
  --color-accent-orange: var(--accent-orange);
  --color-accent-cyan: var(--accent-cyan);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  /* Wise-inspired design tokens — see DESIGN-SYSTEM.md */
  --canvas: #ffffff;
  --canvas-soft: #e8ebe6;
  --ink: #0e0f0c;
  --ink-deep: #163300;
  --body: #454745;
  --mute: #868685;

  --positive: #2ead4b;
  --positive-deep: #054d28;
  --warning: #ffd11a;
  --warning-deep: #b86700;
  --warning-content: #4a3b1c;
  --negative: #d03238;
  --negative-deep: #a72027;
  --negative-darkest: #a7000d;
  --negative-bg: #320707;

  --primary-active: #cdffad;
  --primary-neutral: #c5edab;
  --primary-pale: #e2f6d5;
  --accent-orange: #ffc091;
  --accent-cyan: #38c8ff;

  --background: var(--canvas-soft);
  --foreground: var(--ink);
  --card: var(--canvas);
  --card-foreground: var(--ink);
  --popover: var(--canvas);
  --popover-foreground: var(--ink);
  --primary: #9fe870;
  --primary-foreground: var(--ink);
  --secondary: var(--canvas-soft);
  --secondary-foreground: var(--ink);
  --muted: var(--canvas-soft);
  --muted-foreground: var(--mute);
  --accent: var(--primary-pale);
  --accent-foreground: var(--ink);
  --destructive: var(--negative);
  --border: var(--ink);
  --input: var(--ink);
  --ring: #9fe870;
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

/* Dark mode is Sprint 5 scope — left as the shadcn default (unused/unwired) for now. */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 2: Load Inter alongside Geist in `src/app/layout.tsx` and wrap children in `AuthProvider`**

Replace the full contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvestTrack",
  description:
    "Acompanhe a rentabilidade, o risco e a comparação com benchmarks da sua carteira de investimentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

> This references `@/features/auth/auth-provider`, created in Task 8. `npm run dev` will error until then — that's expected; continue through the tasks in order.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "style: apply Wise-inspired design tokens and load Inter font"
```

---

### Task 2: Restyle `Button` to the brand's 24px pill radius

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Replace the full contents of `src/components/ui/button.tsx`**

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-active",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xl: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

Only three things changed from the original: base radius `rounded-lg` → `rounded-xl` (the brand's canonical 24px), the `default` variant's hover now uses the `primary-active` token instead of a generic opacity fade, and a new `xl` size (48px tall, matching the design system's touch-target guidance) was added for hero CTAs and form submit buttons.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors (unresolved-module errors for files from later tasks are expected until this plan is finished — ignore those for now).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "style: apply 24px pill radius and add xl button size"
```

---

### Task 3: Build the `Input`, `Label`, `FieldError`, `FormAlert`, and `Card` primitives

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/field-error.tsx`
- Create: `src/components/ui/form-alert.tsx`
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Create `src/components/ui/input.tsx`**

```tsx
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-mute focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

- [ ] **Step 2: Create `src/components/ui/label.tsx`**

```tsx
import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-semibold text-ink", className)}
      {...props}
    />
  )
}

export { Label }
```

- [ ] **Step 3: Create `src/components/ui/field-error.tsx`**

```tsx
function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null

  return (
    <p role="alert" className="text-sm text-negative">
      {children}
    </p>
  )
}

export { FieldError }
```

- [ ] **Step 4: Create `src/components/ui/form-alert.tsx`**

```tsx
function FormAlert({ children }: { children?: React.ReactNode }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className="rounded-md border border-negative/30 bg-negative/5 px-4 py-3 text-sm text-negative"
    >
      {children}
    </div>
  )
}

export { FormAlert }
```

- [ ] **Step 5: Create `src/components/ui/card.tsx`**

```tsx
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

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

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Card, cardVariants }
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors from these five files.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/label.tsx src/components/ui/field-error.tsx src/components/ui/form-alert.tsx src/components/ui/card.tsx
git commit -m "feat: add Input, Label, FieldError, FormAlert, and Card primitives"
```

---

### Task 4: API types

**Files:**
- Create: `src/types/api.ts`
- Delete: `src/types/.gitkeep`

- [ ] **Step 1: Create `src/types/api.ts`**

```ts
export type ValidationErrors = Record<string, string[]>

export type ApiError =
  | { kind: "validation"; errors: ValidationErrors }
  | { kind: "business"; message: string }
  | { kind: "rate-limited" }
  | { kind: "unexpected"; message: string }
  | { kind: "network" }

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
```

- [ ] **Step 2: Delete the placeholder**

```bash
git rm src/types/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts
git commit -m "feat: add shared API result/error types"
```

---

### Task 5: `localStorage` session helpers and error-message helpers

**Files:**
- Create: `src/lib/auth-storage.ts`
- Create: `src/lib/validation-errors.ts`

- [ ] **Step 1: Create `src/lib/auth-storage.ts`**

```ts
const TOKEN_KEY = "investtrack:token"
const EXPIRES_KEY = "investtrack:expiraEm"

export interface Session {
  token: string
  expiraEm: string
}

export function saveSession(session: Session): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(EXPIRES_KEY, session.expiraEm)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export function getSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiraEm = localStorage.getItem(EXPIRES_KEY)

  if (!token || !expiraEm) return null

  if (new Date(expiraEm).getTime() <= Date.now()) {
    clearSession()
    return null
  }

  return { token, expiraEm }
}
```

`saveSession`/`clearSession`/`getSession` are only ever called from Client Components (Task 8's `AuthProvider` runs them inside `useEffect`/event handlers), so `localStorage` is always available when they execute — no `typeof window` guard needed.

- [ ] **Step 2: Create `src/lib/validation-errors.ts`**

```ts
import type { ApiError, ValidationErrors } from "@/types/api"

/**
 * The API's exact casing for validation-error keys isn't confirmed yet — this
 * checks both camelCase and PascalCase so the UI degrades gracefully either way.
 */
export function pickError(
  errors: ValidationErrors,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const messages = errors[key]
    if (messages && messages.length > 0) return messages[0]
  }
  return undefined
}

export function getApiErrorMessage(error: ApiError): string {
  switch (error.kind) {
    case "rate-limited":
      return "Muitas tentativas. Aguarde um pouco e tente novamente."
    case "network":
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
    case "business":
    case "unexpected":
      return error.message
    case "validation":
      return "Verifique os campos destacados."
  }
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth-storage.ts src/lib/validation-errors.ts
git commit -m "feat: add localStorage session helpers and API error-message mapping"
```

---

### Task 6: HTTP client and auth service

**Files:**
- Create: `src/services/http-client.ts`
- Create: `src/services/auth-service.ts`
- Delete: `src/services/.gitkeep`

- [ ] **Step 1: Create `src/services/http-client.ts`**

```ts
import type { ApiError, ApiResult } from "@/types/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5158"

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  token?: string
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    return { ok: false, error: { kind: "network" } }
  }

  if (response.status === 429) {
    return { ok: false, error: { kind: "rate-limited" } }
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T }
  }

  const body: unknown = await response.json().catch(() => null)

  if (response.ok) {
    return { ok: true, data: body as T }
  }

  return { ok: false, error: parseErrorBody(response.status, body) }
}

function parseErrorBody(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>

    if (status === 400 && record.errors && typeof record.errors === "object") {
      return {
        kind: "validation",
        errors: record.errors as Record<string, string[]>,
      }
    }

    if (typeof record.message === "string") {
      return { kind: "business", message: record.message }
    }

    if (typeof record.title === "string") {
      const detail = typeof record.detail === "string" ? record.detail : record.title
      return { kind: "unexpected", message: detail }
    }
  }

  return {
    kind: "unexpected",
    message: "Erro inesperado. Tente novamente em instantes.",
  }
}

export const httpClient = {
  get: <T>(path: string, token?: string) => request<T>(path, { method: "GET", token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body, token }),
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", body, token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE", token }),
}
```

- [ ] **Step 2: Create `src/services/auth-service.ts`**

```ts
import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nome: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  expiraEm: string
}

export function login(payload: LoginPayload): Promise<ApiResult<AuthResponse>> {
  return httpClient.post<AuthResponse>("/api/auth/login", payload)
}

export function register(payload: RegisterPayload): Promise<ApiResult<AuthResponse>> {
  return httpClient.post<AuthResponse>("/api/auth/register", payload)
}
```

- [ ] **Step 3: Delete the placeholder**

```bash
git rm src/services/.gitkeep
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add src/services/http-client.ts src/services/auth-service.ts
git commit -m "feat: add HTTP client with normalized error handling and auth service"
```

---

### Task 7: Client-side field validators

**Files:**
- Create: `src/features/auth/validation.ts`

- [ ] **Step 1: Create `src/features/auth/validation.ts`**

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateNome(nome: string): string | undefined {
  if (nome.trim().length === 0) return "Informe seu nome."
  return undefined
}

export function validateEmail(email: string): string | undefined {
  if (email.trim().length === 0) return "Informe seu e-mail."
  if (!EMAIL_PATTERN.test(email)) return "Informe um e-mail válido."
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres."
  if (!/[A-Za-z]/.test(password)) return "A senha deve conter ao menos 1 letra."
  if (!/[0-9]/.test(password)) return "A senha deve conter ao menos 1 número."
  return undefined
}
```

These mirror the rules documented in `ROADMAP.md` → "Contexto da API" → Autenticação: password minimum 8 chars with at least one letter and one number.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/validation.ts
git commit -m "feat: add nome/email/senha validators mirroring API rules"
```

---

### Task 8: `AuthProvider` and `useAuth()`

**Files:**
- Create: `src/features/auth/auth-provider.tsx`
- Delete: `src/features/.gitkeep`

- [ ] **Step 1: Create `src/features/auth/auth-provider.tsx`**

```tsx
"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

import { clearSession, getSession, saveSession, type Session } from "@/lib/auth-storage"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  token: string | null
  login: (session: Session) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setToken(session.token)
      setStatus("authenticated")
    } else {
      setStatus("unauthenticated")
    }
  }, [])

  const login = useCallback((session: Session) => {
    saveSession(session)
    setToken(session.token)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setStatus("unauthenticated")
  }, [])

  return (
    <AuthContext.Provider value={{ status, token, login, logout }}>
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

This is imported by `src/app/layout.tsx` (already wired in Task 1, Step 2). `status` starts as `"loading"` on every mount so the Task 11 dashboard guard can distinguish "still checking `localStorage`" from "confirmed logged out" and avoid a false redirect flash.

- [ ] **Step 2: Delete the placeholder**

```bash
git rm src/features/.gitkeep
```

- [ ] **Step 3: Verify the app boots**

Run: `npx tsc --noEmit`
Expected: No errors — this was the last missing piece referenced by `layout.tsx`.

Run: `npm run dev`, open `http://localhost:3000`.
Expected: The default Next.js starter page still renders (Task 9 replaces it next), no console errors, sage-canvas background already visible behind it from the Task 1 tokens. Stop the server (Ctrl+C) after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/auth-provider.tsx
git commit -m "feat: add AuthProvider with localStorage-backed session state"
```

---

### Task 9: Home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the full contents of `src/app/page.tsx`**

```tsx
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-canvas-soft px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="text-sm font-semibold text-body">InvestTrack</span>
        <h1 className="font-heading text-4xl font-black tracking-tight text-ink sm:text-5xl md:text-6xl">
          Sua carteira de investimentos, sob controle.
        </h1>
        <p className="max-w-xl text-lg text-body">
          Acompanhe rentabilidade, risco e comparação com benchmarks em um só
          lugar — sem planilha, sem retrabalho.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/registro">Criar conta</Link>} nativeButton={false} size="xl" />
          <Button
            render={<Link href="/login">Entrar</Link>}
            nativeButton={false}
            variant="secondary"
            size="xl"
          />
        </div>
      </div>
    </main>
  )
}
```

`@base-ui/react`'s `Button` composes with another element via the `render` prop (not `asChild`, which is a Radix convention this repo doesn't use) — pass the target element with its own children, and set `nativeButton={false}` since the rendered element is an `<a>`, not a `<button>`.

- [ ] **Step 2: Manual check**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: Sage background, headline + subtitle centered, "Criar conta" (lime pill) and "Entrar" (sage pill) buttons side by side on desktop / stacked on mobile width. Both are real links — hovering shows a URL in the status bar, and Ctrl+Click opens in a new tab.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: build Home landing page with Wise-styled hero"
```

---

### Task 10: Login and Registro pages

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/registro/page.tsx`

- [ ] **Step 1: Create `src/app/(auth)/layout.tsx`**

```tsx
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-canvas-soft px-6 py-16">
      <Link href="/" className="mb-8 text-lg font-black tracking-tight text-ink">
        InvestTrack
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  )
}
```

The `(auth)` route group does not appear in the URL — `/login` and `/registro` stay as top-level paths.

- [ ] **Step 2: Create `src/app/(auth)/login/page.tsx`**

```tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-provider"
import { validateEmail, validatePassword } from "@/features/auth/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { login } from "@/services/auth-service"

interface FieldErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login: setSession } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setFieldErrors(errors)
    if (errors.email || errors.password) return

    setIsSubmitting(true)
    const result = await login({ email, password })
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          email: pickError(result.error.errors, "email", "Email"),
          password: pickError(result.error.errors, "password", "Password"),
        })
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    setSession(result.data)
    router.push("/dashboard")
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-body">Acesse sua carteira de investimentos.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FieldError>{fieldErrors.password}</FieldError>
        </div>

        <Button type="submit" size="xl" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Não tem conta?{" "}
        <Link href="/registro" className="font-semibold text-ink underline underline-offset-2">
          Criar conta
        </Link>
      </p>
    </Card>
  )
}
```

- [ ] **Step 3: Create `src/app/(auth)/registro/page.tsx`**

```tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-provider"
import { validateEmail, validateNome, validatePassword } from "@/features/auth/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { register } from "@/services/auth-service"

interface FieldErrors {
  nome?: string
  email?: string
  password?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { login: setSession } = useAuth()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      nome: validateNome(nome),
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setFieldErrors(errors)
    if (errors.nome || errors.email || errors.password) return

    setIsSubmitting(true)
    const result = await register({ nome, email, password })
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          nome: pickError(result.error.errors, "nome", "Nome"),
          email: pickError(result.error.errors, "email", "Email"),
          password: pickError(result.error.errors, "password", "Password"),
        })
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    setSession(result.data)
    router.push("/dashboard")
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-body">Comece a acompanhar sua carteira em minutos.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            autoComplete="name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            aria-invalid={Boolean(fieldErrors.nome)}
          />
          <FieldError>{fieldErrors.nome}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FieldError>{fieldErrors.password}</FieldError>
          {!fieldErrors.password && (
            <p className="text-xs text-mute">Mínimo 8 caracteres, com ao menos 1 letra e 1 número.</p>
          )}
        </div>

        <Button type="submit" size="xl" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </Card>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 5: Manual check (requires the API — local `http://localhost:5158` or set `NEXT_PUBLIC_API_URL` in `.env.local` to the production URL)**

Run: `npm run dev`.
- Visit `/registro`, submit empty form → both "Informe seu nome."/"Informe um e-mail válido."/"A senha deve..." field errors appear, no request sent.
- Register a **new** account with `PETR4`-unrelated throwaway data (e.g. `teste+<timestamp>@example.com`, password `Teste1234`) → redirected to `/dashboard`.
- Open DevTools → Application → Local Storage → confirm `investtrack:token` and `investtrack:expiraEm` are set.
- Visit `/login`, try the same email again on `/registro` → should surface the server's duplicate-email business error in the `FormAlert` banner.
- Log in with the account just created on `/login` → redirected to `/dashboard` again.
- If the validation-error banner/fields don't populate correctly, open the Network tab, inspect the raw `400` response body's `errors` key casing, and adjust the `pickError()` calls in both pages if it differs from `email`/`Email`, `password`/`Password`, `nome`/`Nome`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(auth)"
git commit -m "feat: build Login and Registro pages"
```

---

### Task 11: Protected `/dashboard` placeholder + route guard

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create `src/app/dashboard/layout.tsx`**

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/features/auth/auth-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status !== "authenticated") {
    return (
      <main className="flex flex-1 items-center justify-center bg-canvas-soft">
        <p className="text-sm text-mute">Carregando...</p>
      </main>
    )
  }

  return <>{children}</>
}
```

Because auth state lives only in `localStorage` (no server session, per the project's documented trade-off), this check must run client-side — `status` starts at `"loading"` on every mount (Task 8) so this shows a neutral loading state instead of flashing the redirect before `localStorage` has been read.

- [ ] **Step 2: Create `src/app/dashboard/page.tsx`**

```tsx
"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-provider"

export default function DashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-canvas-soft px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-black text-ink">InvestTrack</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
        <Card>
          <h1 className="text-2xl font-bold text-ink">Bem-vindo!</h1>
          <p className="mt-2 text-sm text-body">
            Sua carteira ainda não tem posições cadastradas. O cadastro de
            ativos chega no próximo sprint.
          </p>
        </Card>
      </div>
    </main>
  )
}
```

This is intentionally a placeholder — Sprint 2 (Minha Carteira) and Sprint 3 (Dashboard) build the real content. Its job here is only to give Login/Registro a redirect target and prove the guard works.

- [ ] **Step 3: Manual check**

Run: `npm run dev`.
- With `investtrack:token` cleared from Local Storage (or an incognito window), visit `http://localhost:3000/dashboard` directly → should redirect to `/login`.
- Log in → redirected to `/dashboard`, shows "Bem-vindo!" and a "Sair" button.
- Click "Sair" → redirected to `/`, Local Storage keys cleared, and re-visiting `/dashboard` redirects to `/login` again.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard
git commit -m "feat: add protected dashboard placeholder with client-side auth guard"
```

---

### Task 12: Full verification pass

**Files:** None to modify — verification only.

- [ ] **Step 1: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: Build completes successfully. Confirm `/`, `/login`, `/registro`, and `/dashboard` all appear in the route summary Next.js prints.

- [ ] **Step 4: Full manual walkthrough against the real API**

Run: `npm run start` (or `npm run dev`) with the API reachable (`http://localhost:5158` running locally, or `NEXT_PUBLIC_API_URL` pointed at `https://investtrackapi.onrender.com` — note only `PETR4`, `MGLU3`, `VALE3`, `ITUB4` have live quotes in production per `ROADMAP.md`, irrelevant here since Sprint 1 has no ticker UI yet).

Walk the whole Sprint 1 success criterion end-to-end in one session:
1. Land on `/` → see hero, click "Criar conta".
2. Register a new account → redirected to `/dashboard`, token present in Local Storage.
3. Click "Sair" → back to `/`, token cleared.
4. Visit `/dashboard` directly (no token) → redirected to `/login`.
5. Click "Entrar" on `/login`'s empty state isn't applicable — instead log in with the account created in step 2 → redirected to `/dashboard`.
6. Refresh `/dashboard` → stays authenticated (session persisted across reloads via `localStorage`).

- [ ] **Step 5: Confirm the risk from the plan header**

Re-check the "Known risks" note about validation-error key casing against what you observed in Task 10 Step 5 / this task's Step 4. If the API consistently uses one casing, feel free to simplify the `pickError()` calls to a single key in a follow-up commit — not required to close out Sprint 1.

---

## Self-Review

**Spec coverage** — every unchecked box in `ROADMAP.md` → Sprint 1 maps to a task:
- Home hero + dual CTA → Task 9.
- Service layer (`src/services/`, base URL fallback, two error formats, `429`) → Task 6.
- Registro form + client validation + server-error display → Task 10.
- Login form → Task 10.
- Token in `localStorage` + post-auth redirect → Task 5, Task 8, Task 10.
- Protected route redirecting to login → Task 11.

**Placeholder scan** — no `TBD`/`later`/"similar to Task N" left in any step; every step shows complete file contents.

**Type consistency** — `ApiResult<T>`/`ApiError` (Task 4) are the only types threaded through `http-client.ts` (Task 6), `validation-errors.ts` (Task 5), and both auth pages (Task 10); `Session` (Task 5) is the only type passed into `AuthProvider.login()` (Task 8) and returned by `AuthResponse` (Task 6) — `AuthResponse` and `Session` both shape as `{ token: string; expiraEm: string }`, so `setSession(result.data)` in Task 10 type-checks without adapting.

# Sprint 4 — Métricas e Simulador Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/metricas` (bar-chart comparison of carteira vs CDI vs Ibovespa + risk stat tiles) and `/simulador` (scenario simulator form + result card), per Sprint 4 of `ROADMAP.md` and `docs/superpowers/specs/2026-07-25-sprint4-metricas-simulador-design.md`.

**Architecture:** Two independent subsystems sharing one plan (per the spec). `ApiError` gains an optional `status` field (propagated from `http-client.ts`) so `/metricas` can tell a `400` (carteira vazia → empty state) apart from a `503` (temporarily unavailable → retry message) — both currently collapse into the same `kind: "business"` shape otherwise. `/metricas` fetches on mount like the existing pages; `/simulador` has no mount fetch, it only reacts to form submission. The bar chart is plain HTML/CSS (`<div>` widths), no SVG needed since bars are rectangles, not arcs.

**Tech Stack:** Next.js 16.2.11 (App Router), React 19, TypeScript, Tailwind CSS v4, `@base-ui/react`. No test framework installed (same carried-over decision as Sprints 1–3); verification is `npx tsc --noEmit` + `npm run lint` + `npm run build` per task, plus a final manual browser pass by the user on `http://localhost:3000` (port 3000 specifically — CORS).

---

## File Structure

```
src/
  types/
    api.ts                          [MODIFY] add status?: number to ApiError
    carteira.ts                     [MODIFY] add MetricasResponse
    simulacao.ts                    [CREATE] SimulacaoPayload, SimulacaoResponse
  services/
    http-client.ts                  [MODIFY] propagate status in parseErrorBody + 429 branch
    carteira-service.ts              [MODIFY] add getMetricas
    simulacao-service.ts             [CREATE] postSimulacao
  features/
    metricas/
      retorno-bar-chart.tsx         [CREATE] bidirectional bar chart, 3 fixed series
      metricas-stat-tiles.tsx       [CREATE] 3 stat cards + dias-considerados caption
    simulador/
      validation.ts                 [CREATE] validateTicker/validateValorInvestido/validateDataInvestimento
      simulador-form.tsx            [CREATE] form, posts to /api/simulacao
      simulacao-result-card.tsx     [CREATE] result display
  app/
    metricas/
      layout.tsx                    [CREATE] ProtectedRoute guard
      page.tsx                      [CREATE] fetch + empty/503/error/success states
    simulador/
      layout.tsx                    [CREATE] ProtectedRoute guard
      page.tsx                      [CREATE] form + result, no mount fetch
    dashboard/
      page.tsx                      [MODIFY] add "Métricas" and "Simulador" nav links
```

---

### Task 1: Extend `ApiError` with `status`

**Files:**
- Modify: `src/types/api.ts`

- [ ] **Step 1: Rewrite the file**

```ts
export type ValidationErrors = Record<string, string[]>

export type ApiError =
  | { kind: "validation"; errors: ValidationErrors; status?: number }
  | { kind: "business"; message: string; status?: number }
  | { kind: "rate-limited"; status?: number }
  | { kind: "unexpected"; message: string; status?: number }
  | { kind: "network"; status?: number }

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
```

(`status` is on every variant, including `network`, so callers can read `error.status` without narrowing on `kind` first — a `network` failure just never populates it.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors in `src/services/http-client.ts` (object literals no longer matching call sites that construct `ApiError` — expected until Task 2 fixes it). If `http-client.ts` shows no errors yet, that's fine too (the field is optional); either way, move to Task 2 before committing.

- [ ] **Step 3: Commit together with Task 2**

(No separate commit here — `types/api.ts` and `http-client.ts` change together in Task 2's commit, since a partial commit would leave `status` always `undefined`.)

---

### Task 2: Propagate `status` through `http-client.ts`

**Files:**
- Modify: `src/services/http-client.ts`

- [ ] **Step 1: Rewrite the file**

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
    return { ok: false, error: { kind: "rate-limited", status: response.status } }
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
        status,
      }
    }

    if (typeof record.message === "string") {
      return { kind: "business", message: record.message, status }
    }

    if (typeof record.title === "string") {
      const detail = typeof record.detail === "string" ? record.detail : record.title
      return { kind: "unexpected", message: detail, status }
    }
  }

  return {
    kind: "unexpected",
    message: "Erro inesperado. Tente novamente em instantes.",
    status,
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

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts src/services/http-client.ts
git commit -m "feat: propagate HTTP status on ApiError for status-specific handling"
```

---

### Task 3: `MetricasResponse` type + `getMetricas` service

**Files:**
- Modify: `src/types/carteira.ts`
- Modify: `src/services/carteira-service.ts`

- [ ] **Step 1: Append the type**

Add to the end of `src/types/carteira.ts`:

```ts
export interface MetricasResponse {
  diasConsiderados: number | string
  volatilidadeAnualizada: number | string
  retornoAnualizadoCarteira: number | string
  sharpeRatio: number | string
  drawdownMaximo: number | string
  retornoAnualizadoCdi: number | string
  retornoAnualizadoIbovespa: number | string | null
}
```

- [ ] **Step 2: Add the service function**

In `src/services/carteira-service.ts`, add `MetricasResponse` to the existing `import type { ... } from "@/types/carteira"` block, and append after `getResumo`:

```ts
export function getMetricas(token: string): Promise<ApiResult<MetricasResponse>> {
  return httpClient.get<MetricasResponse>("/api/carteira/metricas", token)
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/carteira.ts src/services/carteira-service.ts
git commit -m "feat: add MetricasResponse type and getMetricas call"
```

---

### Task 4: `src/types/simulacao.ts`

**Files:**
- Create: `src/types/simulacao.ts`

- [ ] **Step 1: Write the file**

```ts
export interface SimulacaoPayload {
  ticker: string
  valorInvestido: number
  dataInvestimento: string
}

export interface SimulacaoResponse {
  ticker: string
  valorInvestido: number | string
  dataInvestimento: string
  precoNaData: number | string
  precoAtual: number | string
  valorAtual: number | string
  rentabilidadeValor: number | string
  rentabilidadePercentual: number | string
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/simulacao.ts
git commit -m "feat: add SimulacaoPayload and SimulacaoResponse types"
```

---

### Task 5: `src/services/simulacao-service.ts`

**Files:**
- Create: `src/services/simulacao-service.ts`

- [ ] **Step 1: Write the file**

```ts
import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type { SimulacaoPayload, SimulacaoResponse } from "@/types/simulacao"

export function postSimulacao(
  payload: SimulacaoPayload,
  token: string
): Promise<ApiResult<SimulacaoResponse>> {
  return httpClient.post<SimulacaoResponse>("/api/simulacao", payload, token)
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/simulacao-service.ts
git commit -m "feat: add postSimulacao service call"
```

---

### Task 6: `src/features/simulador/validation.ts`

**Files:**
- Create: `src/features/simulador/validation.ts`

- [ ] **Step 1: Write the file**

```ts
export function validateTicker(ticker: string): string | undefined {
  if (ticker.trim().length === 0) return "Informe o ticker."
  if (ticker.length > 20) return "O ticker deve ter no máximo 20 caracteres."
  return undefined
}

export function validateValorInvestido(valorInvestido: string): string | undefined {
  if (valorInvestido.trim().length === 0) return "Informe o valor investido."
  const valor = Number(valorInvestido)
  if (!Number.isFinite(valor) || valor < 0.01) {
    return "O valor investido deve ser de no mínimo R$ 0,01."
  }
  return undefined
}

export function validateDataInvestimento(dataInvestimento: string): string | undefined {
  if (dataInvestimento.trim().length === 0) return "Informe a data do investimento."
  if (Number.isNaN(Date.parse(dataInvestimento))) return "Informe uma data válida."
  return undefined
}
```

- [ ] **Step 2: Manual verification (no test framework in this project)**

Run: `npx tsc --noEmit`
Expected: no errors.

Sanity-check by eye (re-verified end-to-end in Task 14's manual browser pass):
- `validateTicker("")` → error message; `validateTicker("PETR4")` → `undefined`; `validateTicker("X".repeat(21))` → error message.
- `validateValorInvestido("0")` → error (below the 0.01 minimum); `validateValorInvestido("100")` → `undefined`.
- `validateDataInvestimento("not-a-date")` → error; `validateDataInvestimento("2026-01-01")` → `undefined`.

- [ ] **Step 3: Commit**

```bash
git add src/features/simulador/validation.ts
git commit -m "feat: add simulador form validators"
```

---

### Task 7: `RetornoBarChart` component

**Files:**
- Create: `src/features/metricas/retorno-bar-chart.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { formatPercent } from "@/lib/format"

export interface RetornoBarItem {
  label: string
  value: number | null
  color: string
}

interface RetornoBarChartProps {
  itens: RetornoBarItem[]
}

export function RetornoBarChart({ itens }: RetornoBarChartProps) {
  const valoresConhecidos = itens
    .map((item) => item.value)
    .filter((value): value is number => value !== null)
  const maxAbs = Math.max(...valoresConhecidos.map((value) => Math.abs(value)), 1)

  return (
    <div className="flex flex-col gap-4">
      {itens.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-sm text-ink">{item.label}</span>

          {item.value === null ? (
            <span className="flex-1 text-sm text-mute">indisponível</span>
          ) : (
            <div className="relative h-6 flex-1 rounded-md bg-canvas-soft">
              <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
              <div
                className="absolute inset-y-0 rounded-md"
                style={{
                  backgroundColor: item.color,
                  left:
                    item.value >= 0
                      ? "50%"
                      : `${50 - (Math.abs(item.value) / maxAbs) * 50}%`,
                  width: `${(Math.abs(item.value) / maxAbs) * 50}%`,
                }}
              />
            </div>
          )}

          <span className="w-16 shrink-0 text-right text-sm font-semibold text-ink">
            {item.value === null ? "" : formatPercent(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/metricas/retorno-bar-chart.tsx
git commit -m "feat: add RetornoBarChart bidirectional bar component"
```

---

### Task 8: `MetricasStatTiles` component

**Files:**
- Create: `src/features/metricas/metricas-stat-tiles.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { Card } from "@/components/ui/card"
import { formatPercent, toNumber } from "@/lib/format"
import type { MetricasResponse } from "@/types/carteira"

interface MetricasStatTilesProps {
  metricas: MetricasResponse
}

export function MetricasStatTiles({ metricas }: MetricasStatTilesProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <span className="text-sm text-mute">Volatilidade Anualizada</span>
          <span className="text-2xl font-semibold text-ink">
            {formatPercent(metricas.volatilidadeAnualizada)}
          </span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-sm text-mute">Sharpe Ratio</span>
          <span className="text-2xl font-semibold text-ink">
            {toNumber(metricas.sharpeRatio).toFixed(2)}
          </span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-sm text-mute">Drawdown Máximo</span>
          <span className="text-2xl font-semibold text-ink">
            {formatPercent(metricas.drawdownMaximo)}
          </span>
        </Card>
      </div>

      <p className="text-xs text-mute">
        Baseado em {toNumber(metricas.diasConsiderados)} dias de histórico.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/metricas/metricas-stat-tiles.tsx
git commit -m "feat: add MetricasStatTiles component"
```

---

### Task 9: `/metricas` page

**Files:**
- Create: `src/app/metricas/layout.tsx`
- Create: `src/app/metricas/page.tsx`

- [ ] **Step 1: Write the layout**

```tsx
import { ProtectedRoute } from "@/features/auth/protected-route"

export default function MetricasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
```

- [ ] **Step 2: Write the page**

```tsx
"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormAlert } from "@/components/ui/form-alert"
import { useAuth } from "@/features/auth/auth-provider"
import { MetricasStatTiles } from "@/features/metricas/metricas-stat-tiles"
import { RetornoBarChart, type RetornoBarItem } from "@/features/metricas/retorno-bar-chart"
import { toNumber } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { getMetricas } from "@/services/carteira-service"
import type { MetricasResponse } from "@/types/carteira"

export default function MetricasPage() {
  const { token } = useAuth()

  const [metricas, setMetricas] = useState<MetricasResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchMetricas = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setIsEmpty(false)
    setLoadError(null)

    const result = await getMetricas(token)
    setIsLoading(false)

    if (!result.ok) {
      if (result.error.status === 400) {
        setIsEmpty(true)
        return
      }
      if (result.error.status === 503) {
        setLoadError("Métricas indisponíveis no momento. Tente novamente mais tarde.")
        return
      }
      setLoadError(getApiErrorMessage(result.error))
      return
    }

    setMetricas(result.data)
  }, [token])

  useEffect(() => {
    fetchMetricas()
  }, [fetchMetricas])

  if (!token) return null

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

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Métricas
        </h1>

        {isLoading && <p className="text-body">Carregando...</p>}

        {!isLoading && isEmpty && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-body">Você ainda não tem posições na carteira.</p>
            <Button
              render={<Link href="/carteira">Adicionar posição</Link>}
              nativeButton={false}
            />
          </Card>
        )}

        {!isLoading && !isEmpty && loadError && (
          <div className="flex flex-col items-start gap-3">
            <FormAlert>{loadError}</FormAlert>
            <Button variant="outline" onClick={fetchMetricas}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !isEmpty && !loadError && metricas && (
          <div className="flex flex-col gap-6">
            <Card>
              <RetornoBarChart itens={itensRetorno} />
            </Card>
            <MetricasStatTiles metricas={metricas} />
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
git add src/app/metricas/layout.tsx src/app/metricas/page.tsx
git commit -m "feat: build Métricas page with retorno bar chart and stat tiles"
```

---

### Task 10: `SimuladorForm` component

**Files:**
- Create: `src/features/simulador/simulador-form.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  validateDataInvestimento,
  validateTicker,
  validateValorInvestido,
} from "@/features/simulador/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { postSimulacao } from "@/services/simulacao-service"
import type { SimulacaoResponse } from "@/types/simulacao"

interface FieldErrors {
  ticker?: string
  valorInvestido?: string
  dataInvestimento?: string
}

interface SimuladorFormProps {
  token: string
  onResult: (resultado: SimulacaoResponse) => void
}

function toDataInvestimentoIso(dateInputValue: string): string {
  return new Date(`${dateInputValue}T00:00:00Z`).toISOString()
}

export function SimuladorForm({ token, onResult }: SimuladorFormProps) {
  const [ticker, setTicker] = useState("")
  const [valorInvestido, setValorInvestido] = useState("")
  const [dataInvestimento, setDataInvestimento] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      ticker: validateTicker(ticker),
      valorInvestido: validateValorInvestido(valorInvestido),
      dataInvestimento: validateDataInvestimento(dataInvestimento),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setIsSubmitting(true)
    const result = await postSimulacao(
      {
        ticker,
        valorInvestido: Number(valorInvestido),
        dataInvestimento: toDataInvestimentoIso(dataInvestimento),
      },
      token
    )
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          ticker: pickError(result.error.errors, "ticker", "Ticker"),
          valorInvestido: pickError(result.error.errors, "valorInvestido", "ValorInvestido"),
          dataInvestimento: pickError(
            result.error.errors,
            "dataInvestimento",
            "DataInvestimento"
          ),
        })
        return
      }
      if (result.error.status === 404) {
        setFormError("Não encontramos cotação para esse ticker na data informada.")
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    onResult(result.data)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <FormAlert>{formError}</FormAlert>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ticker">Ticker</Label>
        <Input
          id="ticker"
          value={ticker}
          onChange={(event) => setTicker(event.target.value.toUpperCase())}
          aria-invalid={Boolean(fieldErrors.ticker)}
        />
        <p className="text-xs text-mute">
          Hoje só PETR4, MGLU3, VALE3 e ITUB4 têm cotação disponível em produção.
        </p>
        <FieldError>{fieldErrors.ticker}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="valorInvestido">Valor investido</Label>
        <Input
          id="valorInvestido"
          type="number"
          step="0.01"
          min="0"
          value={valorInvestido}
          onChange={(event) => setValorInvestido(event.target.value)}
          aria-invalid={Boolean(fieldErrors.valorInvestido)}
        />
        <FieldError>{fieldErrors.valorInvestido}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dataInvestimento">Data do investimento</Label>
        <Input
          id="dataInvestimento"
          type="date"
          value={dataInvestimento}
          onChange={(event) => setDataInvestimento(event.target.value)}
          aria-invalid={Boolean(fieldErrors.dataInvestimento)}
        />
        <FieldError>{fieldErrors.dataInvestimento}</FieldError>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Simulando..." : "Simular"}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/simulador/simulador-form.tsx
git commit -m "feat: add SimuladorForm component"
```

---

### Task 11: `SimulacaoResultCard` component

**Files:**
- Create: `src/features/simulador/simulacao-result-card.tsx`

- [ ] **Step 1: Write the file**

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
      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">
          {resultado.ticker} em {formatDateBR(resultado.dataInvestimento)}
        </span>
        <span className="text-sm text-ink">
          Preço na data: {formatCurrencyBRL(resultado.precoNaData)} · Preço atual:{" "}
          {formatCurrencyBRL(resultado.precoAtual)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor investido</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resultado.valorInvestido)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor atual</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resultado.valorAtual)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-mute">Rentabilidade</span>
        <span className={`text-2xl font-semibold ${rentabilidadeColor}`}>
          {formatCurrencyBRL(resultado.rentabilidadeValor)} (
          {formatPercent(resultado.rentabilidadePercentual)})
        </span>
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/simulador/simulacao-result-card.tsx
git commit -m "feat: add SimulacaoResultCard component"
```

---

### Task 12: `/simulador` page

**Files:**
- Create: `src/app/simulador/layout.tsx`
- Create: `src/app/simulador/page.tsx`

- [ ] **Step 1: Write the layout**

```tsx
import { ProtectedRoute } from "@/features/auth/protected-route"

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
```

- [ ] **Step 2: Write the page**

```tsx
"use client"

import { useState } from "react"

import { useAuth } from "@/features/auth/auth-provider"
import { SimulacaoResultCard } from "@/features/simulador/simulacao-result-card"
import { SimuladorForm } from "@/features/simulador/simulador-form"
import type { SimulacaoResponse } from "@/types/simulacao"

export default function SimuladorPage() {
  const { token } = useAuth()
  const [resultado, setResultado] = useState<SimulacaoResponse | null>(null)

  if (!token) return null

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Simulador
        </h1>

        <SimuladorForm token={token} onResult={setResultado} />

        {resultado && <SimulacaoResultCard resultado={resultado} />}
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
git add src/app/simulador/layout.tsx src/app/simulador/page.tsx
git commit -m "feat: build Simulador page with form and result card"
```

---

### Task 13: Dashboard nav links

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add the two links**

In the header's button row, add "Métricas" and "Simulador" links between "Minha carteira" and "Sair":

```tsx
          <div className="flex gap-3">
            <Button
              render={<Link href="/carteira">Minha carteira</Link>}
              nativeButton={false}
              variant="outline"
            />
            <Button
              render={<Link href="/metricas">Métricas</Link>}
              nativeButton={false}
              variant="outline"
            />
            <Button
              render={<Link href="/simulador">Simulador</Link>}
              nativeButton={false}
              variant="outline"
            />
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
```

(Replaces the existing `<div className="flex gap-3">...</div>` block that currently only has "Minha carteira" and "Sair".)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add Métricas and Simulador nav links to dashboard"
```

---

### Task 14: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Lint the touched files directly**

Run: `npx eslint src/types/api.ts src/types/carteira.ts src/types/simulacao.ts src/services/http-client.ts src/services/carteira-service.ts src/services/simulacao-service.ts src/features/metricas/retorno-bar-chart.tsx src/features/metricas/metricas-stat-tiles.tsx src/features/simulador/validation.ts src/features/simulador/simulador-form.tsx src/features/simulador/simulacao-result-card.tsx src/app/metricas/layout.tsx src/app/metricas/page.tsx src/app/simulador/layout.tsx src/app/simulador/page.tsx src/app/dashboard/page.tsx`

Expected: no errors, except the already-known `react-hooks/set-state-in-effect` on `src/app/metricas/page.tsx`'s mount-fetch `useEffect` — same pre-existing, accepted pattern as `/carteira` and `/dashboard` (tracked as a Sprint 5 backlog item in `ROADMAP.md`, not something to fix here). If any *other* rule fires, fix it in the relevant file from Tasks 1–13 before continuing.

(Don't run plain `npm run lint` — it also walks a stray worktree at `.claude/worktrees/tingly-twirling-acorn/.next/build/` that isn't part of this project's source and floods the output with unrelated errors.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds (no type or compile errors).

- [ ] **Step 3: Manual browser check (done by the user, not the agent)**

Tell the user to run `npm run dev` (port 3000 — CORS) and check, logged in:
1. `/metricas` with a populated carteira → 3 barras (Carteira/CDI/Ibovespa) com rótulo percentual, mais os 3 stat tiles e a legenda de dias considerados.
2. `/metricas` with an empty carteira (`400`) → card de estado vazio + botão para `/carteira` (não o gráfico quebrado).
3. `/simulador` com um ticker testável (`PETR4`, `MGLU3`, `VALE3`, ou `ITUB4`), um valor e uma data → card de resultado aparece abaixo do formulário com os valores certos.
4. `/simulador` com um ticker inventado (ex: `ZZZZ9`) → mensagem "Não encontramos cotação para esse ticker na data informada." em vez de tela quebrada.
5. Links "Métricas" e "Simulador" no dashboard levam às páginas certas.

- [ ] **Step 4: Fix anything the user reports, then commit if needed**

If the manual check surfaces issues, fix them in the relevant file from Tasks 1–13 and commit as `fix: <description>`.

---

## Post-implementation (outside this plan)

Once Task 14 is confirmed working by the user, update `ROADMAP.md` on this branch:
- Mark Sprint 4's two checkboxes `[x]` and its progress-log entry "concluído" (today's date), noting the "gráfico de linha → barras" deviation and why (no time-series data exists on `/api/carteira/metricas`).

This is a docs-only change tracked separately from this implementation plan, not a coding task.

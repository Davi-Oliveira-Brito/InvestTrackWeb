# Sprint 3 — Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/dashboard` placeholder with real cards of resumo (`GET /api/carteira/resumo`) and a pie chart of allocation by asset type, per Sprint 3 of `ROADMAP.md` and `docs/superpowers/specs/2026-07-25-sprint3-dashboard-design.md`.

**Architecture:** `dashboard/page.tsx` fetches `getResumo(token)` and `listPosicoes(token)` in parallel on mount. The resumo response feeds four stat cards directly; the position list is aggregated client-side by `tipo` (no per-tipo breakdown exists on the resumo endpoint) into pie-chart slices. The pie is a hand-written SVG (no chart library — same "no unnecessary dependency" call as Sprint 1's decision to skip form libraries), using the dataviz-skill-validated 3-color categorical palette (blue/orange/aqua) mapped by fixed `tipo`, never by slice rank.

**Tech Stack:** Next.js 16.2.11 (App Router), React 19, TypeScript, Tailwind CSS v4, `@base-ui/react`. No test framework is installed in this project (explicit decision carried over from Sprint 1 — see `docs/superpowers/plans/2026-07-24-sprint1-home-auth.md`); verification here is `npx tsc --noEmit` + `npm run lint` + `npm run build` per task, plus a final manual browser pass by the user on `http://localhost:3000` (dev server must run on port 3000 — the API's CORS allowlist only permits that origin locally).

---

## File Structure

```
src/
  types/
    carteira.ts               [MODIFY] add ResumoResponse
  services/
    carteira-service.ts       [MODIFY] add getResumo
  features/
    dashboard/
      aggregate-by-tipo.ts    [CREATE] pure aggregation: PosicaoResponse[] -> AlocacaoTipo[]
      resumo-cards.tsx        [CREATE] 4 stat cards from ResumoResponse
      allocation-pie-chart.tsx [CREATE] SVG pie + legend from AlocacaoTipo[]
  app/
    dashboard/
      page.tsx                [MODIFY] replace placeholder with real dashboard
```

---

### Task 1: `ResumoResponse` type

**Files:**
- Modify: `src/types/carteira.ts`

- [ ] **Step 1: Append the type**

Add to the end of `src/types/carteira.ts` (after `EditarPosicaoPayload`):

```ts
export interface ResumoResponse {
  quantidadePosicoes: number
  quantidadePosicoesSemCotacao: number
  valorTotalInvestido: number | string
  valorTotalAtual: number | string | null
  rentabilidadeTotalValor: number | string | null
  rentabilidadeTotalPercentual: number | string | null
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/carteira.ts
git commit -m "feat: add ResumoResponse type for carteira resumo endpoint"
```

---

### Task 2: `getResumo` service function

**Files:**
- Modify: `src/services/carteira-service.ts`

- [ ] **Step 1: Add the function**

Add to `src/services/carteira-service.ts`, alongside `listPosicoes` (same file already imports `httpClient`, `ApiResult`, and needs `ResumoResponse` added to its type import):

```ts
import { httpClient } from "./http-client"
import type { ApiResult } from "@/types/api"
import type {
  CriarPosicaoPayload,
  EditarPosicaoPayload,
  PosicaoResponse,
  ResumoResponse,
} from "@/types/carteira"

export function getResumo(token: string): Promise<ApiResult<ResumoResponse>> {
  return httpClient.get<ResumoResponse>("/api/carteira/resumo", token)
}
```

(Only the `import type` line changes — add `ResumoResponse` to it — and the new `getResumo` function is appended after `listPosicoes`; `createPosicao`/`updatePosicao`/`deletePosicao` stay untouched.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/carteira-service.ts
git commit -m "feat: add getResumo call to carteira service"
```

---

### Task 3: `aggregateByTipo` pure function

**Files:**
- Create: `src/features/dashboard/aggregate-by-tipo.ts`

- [ ] **Step 1: Write the file**

```ts
import { toNumber } from "@/lib/format"
import { TIPO_LABELS, TIPOS_ATIVO } from "@/features/carteira/tipo-ativo"
import type { PosicaoResponse, TipoAtivo } from "@/types/carteira"

export interface AlocacaoTipo {
  tipo: TipoAtivo
  label: string
  value: number
  percent: number
  color: string
}

const CORES_POR_TIPO: Record<TipoAtivo, string> = {
  Acao: "#2a78d6",
  FII: "#eb6834",
  RendaFixa: "#1baf7a",
}

export function aggregateByTipo(posicoes: PosicaoResponse[]): AlocacaoTipo[] {
  const totals: Record<TipoAtivo, number> = {
    Acao: 0,
    FII: 0,
    RendaFixa: 0,
  }

  for (const posicao of posicoes) {
    const peso = toNumber(posicao.valorAtual ?? posicao.valorInvestido)
    totals[posicao.tipo] += peso
  }

  const grandTotal = totals.Acao + totals.FII + totals.RendaFixa

  return TIPOS_ATIVO.filter((tipo) => totals[tipo] > 0).map((tipo) => ({
    tipo,
    label: TIPO_LABELS[tipo],
    value: totals[tipo],
    percent: grandTotal > 0 ? (totals[tipo] / grandTotal) * 100 : 0,
    color: CORES_POR_TIPO[tipo],
  }))
}
```

- [ ] **Step 2: Manual verification (no test framework in this project)**

Run: `npx tsc --noEmit`
Expected: no errors.

Since there's no test runner installed, sanity-check the logic by eye against these three cases (verified again end-to-end in Task 7's manual browser pass):
- Empty array in → empty array out (no division by zero: `grandTotal > 0 ? … : 0` guards it).
- One `Acao` position with `valorAtual: null, valorInvestido: 1000` → `[{ tipo: "Acao", value: 1000, percent: 100, color: "#2a78d6" }]`.
- One `Acao` (`valorAtual: 600`) + one `FII` (`valorAtual: 400`) → two entries, 60% / 40%, `RendaFixa` absent (filtered out at `totals[tipo] > 0`).

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/aggregate-by-tipo.ts
git commit -m "feat: add tipo allocation aggregation for dashboard pie chart"
```

---

### Task 4: `ResumoCards` component

**Files:**
- Create: `src/features/dashboard/resumo-cards.tsx`

- [ ] **Step 1: Write the file**

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
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor Investido</span>
        <span className="text-2xl font-semibold text-ink">
          {formatCurrencyBRL(resumo.valorTotalInvestido)}
        </span>
      </Card>

      <Card className="flex flex-col gap-1">
        <span className="text-sm text-mute">Valor Atual</span>
        <span className="text-2xl font-semibold text-ink">
          {resumo.valorTotalAtual === null
            ? "Cotação pendente"
            : formatCurrencyBRL(resumo.valorTotalAtual)}
        </span>
      </Card>

      <Card className="flex flex-col gap-1">
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

      <Card className="flex flex-col gap-1">
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
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/resumo-cards.tsx
git commit -m "feat: add ResumoCards component for dashboard summary"
```

---

### Task 5: `AllocationPieChart` component

**Files:**
- Create: `src/features/dashboard/allocation-pie-chart.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { formatCurrencyBRL, formatPercent } from "@/lib/format"
import type { AlocacaoTipo } from "./aggregate-by-tipo"

const SIZE = 200
const RADIUS = 90
const CENTER = SIZE / 2

function polarToCartesian(angleDeg: number): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  }
}

function describeSlice(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(endAngle)
  const end = polarToCartesian(startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

interface AllocationPieChartProps {
  alocacao: AlocacaoTipo[]
}

export function AllocationPieChart({ alocacao }: AllocationPieChartProps) {
  if (alocacao.length === 0) return null

  let cumulativeAngle = 0
  const slices = alocacao.map((item) => {
    const startAngle = cumulativeAngle
    cumulativeAngle += (item.percent / 100) * 360
    return { ...item, startAngle, endAngle: cumulativeAngle }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Alocação da carteira por tipo de ativo"
      >
        {slices.length === 1 ? (
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={slices[0].color}>
            <title>
              {`${slices[0].label} — ${formatCurrencyBRL(slices[0].value)} (${formatPercent(slices[0].percent)})`}
            </title>
          </circle>
        ) : (
          slices.map((slice) => (
            <path
              key={slice.tipo}
              d={describeSlice(slice.startAngle, slice.endAngle)}
              fill={slice.color}
            >
              <title>
                {`${slice.label} — ${formatCurrencyBRL(slice.value)} (${formatPercent(slice.percent)})`}
              </title>
            </path>
          ))
        )}
      </svg>

      <ul className="flex w-full flex-col gap-2">
        {alocacao.map((item) => (
          <li
            key={item.tipo}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-ink">{item.label}</span>
            </span>
            <span className="text-mute">{formatPercent(item.percent)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/allocation-pie-chart.tsx
git commit -m "feat: add AllocationPieChart SVG component"
```

---

### Task 6: Rewrite `dashboard/page.tsx`

**Files:**
- Modify: `src/app/dashboard/page.tsx:1-29` (full replacement of the placeholder)

- [ ] **Step 1: Replace the file contents**

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
  const { token, logout } = useAuth()

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
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Dashboard
          </h1>
          <div className="flex gap-3">
            <Button
              render={<Link href="/carteira">Minha carteira</Link>}
              nativeButton={false}
              variant="outline"
            />
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

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

Note: this keeps the existing "Minha carteira" nav link from the placeholder (there is no shared app-shell nav elsewhere in the project — `/dashboard` and `/carteira` are each standalone pages — so dropping it would remove the only way to navigate from dashboard to carteira).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: build Dashboard page with resumo cards and allocation pie chart"
```

---

### Task 7: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds (no type or compile errors).

- [ ] **Step 3: Manual browser check (done by the user, not the agent)**

Tell the user to run `npm run dev` (must bind to port 3000 — the API's CORS allowlist only permits `http://localhost:3000`) and check, logged in at `http://localhost:3000/dashboard`:
1. Carteira vazia → card "Você ainda não tem posições" + botão para `/carteira`, sem cards/pizza.
2. Carteira com posições de mais de um `tipo` → 4 cards preenchidos + pizza com uma fatia por tipo presente + legenda com percentuais batendo 100% no total.
3. Alguma posição com `valorAtual: null` (recém-criada, antes do job de 30 min rodar) → card "Valor Atual"/"Rentabilidade" mostrando "Cotação pendente", mas a posição ainda conta na pizza via fallback pro `valorInvestido`, e o card "Posições" mostra a nota "N aguardando cotação".
4. Token expirado/inválido → mensagem de erro + botão "Tentar novamente" aparecem, não uma tela quebrada.

- [ ] **Step 4: Fix anything the user reports, then commit if needed**

If lint/build/manual check surface issues, fix them in the relevant file from Tasks 1–6 and commit as `fix: <description>`.

---

## Post-implementation (outside this plan)

Once Task 7 is confirmed working by the user, update `ROADMAP.md` on this branch:
- Mark Sprint 2's four checkboxes `[x]` and its progress-log entry "concluído" (already shipped and merged to `main` via PR #2, just never reflected in the doc).
- Mark Sprint 3's two checkboxes `[x]` and its progress-log entry "concluído" (today's date).

This is a docs-only change tracked separately from this implementation plan, not a coding task.

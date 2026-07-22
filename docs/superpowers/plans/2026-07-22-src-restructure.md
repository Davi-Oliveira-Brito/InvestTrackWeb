# Restructure to `src/` Directory - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `app/`, `components/`, and `lib/` into `src/`, create empty feature directories, update configs and imports so `npm run dev` and `npm run build` pass.

**Architecture:** Move existing directories into `src/`, create `.gitkeep`-only directories for `features/`, `services/`, `hooks/`, `types/`. Update `tsconfig.json` path alias and `components.json` paths. Fix all internal imports. Next.js auto-detects `src/` so no `next.config.ts` change needed.

**Tech Stack:** Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind CSS

## Current File Structure (relevant files)

```
investtrack-web/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx          ← imports "./globals.css" (relative)
│   └── page.tsx            ← no relative project imports
├── components/
│   └── ui/
│       └── button.tsx      ← imports "@/lib/utils"
├── lib/
│   └── utils.ts            ← no project imports
├── components.json         ← references app/globals.css + @/ aliases
├── tsconfig.json           ← @/* → ./*
├── next.config.ts
└── ...
```

## Imports Map (what can break)

| File | Import | Type | Will break? |
|------|--------|------|-------------|
| `app/layout.tsx` | `"./globals.css"` | relative | No (file moves with directory) |
| `components/ui/button.tsx` | `"@/lib/utils"` | alias | No (`@/lib` resolves to `src/lib` after tsconfig change) |
| `components.json` | `"app/globals.css"` | literal path | **Yes** → `src/app/globals.css` |

## Global Constraints

- Do NOT alter any logic, only file locations and import paths
- Preserve all file contents exactly
- `@/*` alias must resolve to `src/*`
- shadcn CLI (`npx shadcn add`) must continue to work
- `npm run dev` and `npm run build` must pass

---

### Task 1: Move directories and create empty feature folders

**Files:**
- Move: `app/` → `src/app/`
- Move: `components/` → `src/components/`
- Move: `lib/` → `src/lib/`
- Create: `src/features/.gitkeep`
- Create: `src/services/.gitkeep`
- Create: `src/hooks/.gitkeep`
- Create: `src/types/.gitkeep`

**No interfaces consumed/produced (file system operation only).**

- [ ] **Step 1: Create `src/` directory**

```powershell
mkdir src
```

- [ ] **Step 2: Move `app/`, `components/`, `lib/` into `src/`**

```powershell
Move-Item -Path app -Destination src\app
Move-Item -Path components -Destination src\components
Move-Item -Path lib -Destination src\lib
```

- [ ] **Step 3: Create empty feature directories with `.gitkeep`**

```powershell
New-Item -Path src\features\.gitkeep -ItemType File -Force
New-Item -Path src\services\.gitkeep -ItemType File -Force
New-Item -Path src\hooks\.gitkeep -ItemType File -Force
New-Item -Path src\types\.gitkeep -ItemType File -Force
```

- [ ] **Step 4: Verify structure**

```powershell
Get-ChildItem src -Recurse -Depth 2 | Select-Object FullName
```

Expected: `src/app/`, `src/components/`, `src/lib/`, `src/features/`, `src/services/`, `src/hooks/`, `src/types/` all present.

---

### Task 2: Update `tsconfig.json`

**Files:**
- Modify: `tsconfig.json:22`

**Interfaces:** Consumes: current `"@/*": ["./*"]`. Produces: `"@/*": ["./src/*"]`.

- [ ] **Step 1: Update path alias**

In `tsconfig.json`, change:

```json
"paths": {
  "@/*": ["./*"]
}
```

to:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 2: Verify `include` still covers `src/`**

The current `include` array has `"**/*.ts"`, `"**/*.tsx"`, `"**/*.mts"` — these globs will match `src/` contents automatically. No change needed.

---

### Task 3: Update `components.json`

**Files:**
- Modify: `components.json:8` (css path)
- Modify: `components.json:16-20` (aliases stay the same since they use `@/`)

**Interfaces:** Consumes: tsconfig `@/*` alias. Produces: correct paths for shadcn CLI.

- [ ] **Step 1: Update CSS path**

In `components.json`, change:

```json
"css": "app/globals.css"
```

to:

```json
"css": "src/app/globals.css"
```

- [ ] **Step 2: Verify aliases**

The `aliases` block uses `@/components`, `@/lib/utils`, `@/lib`, `@/hooks` — these resolve via `tsconfig.json` paths and remain correct after the alias update. No change needed.

---

### Task 4: Verify all imports (no code changes expected)

**Files:** None to modify (verification only).

**Interfaces:** Checks that Task 2's alias and Task 3's config work correctly.

- [ ] **Step 1: Grep for relative imports in moved files**

Search all `.ts` and `.tsx` files under `src/` for import statements to confirm none reference parent directories that no longer exist.

```powershell
Get-ChildItem src -Recurse -Include *.ts,*.tsx | Select-String -Pattern "from\s+['\"].*['\"]"
```

Expected: Only `"./globals.css"` in `src/app/layout.tsx` and `"@/lib/utils"` in `src/components/ui/button.tsx`. Both are correct.

---

### Task 5: Run `npm run dev` and `npm run build`

**Files:** None to modify (verification only).

**Interfaces:** Consumes: all prior tasks complete. Produces: confirmed working project.

- [ ] **Step 1: Run dev server (quick smoke test)**

```powershell
npm run dev
```

Expected: Server starts on `http://localhost:3000` without errors. Stop after confirming startup (Ctrl+C).

- [ ] **Step 2: Run production build**

```powershell
npm run build
```

Expected: Build completes successfully with no errors.

- [ ] **Step 3: Run lint**

```powershell
npm run lint
```

Expected: No lint errors.

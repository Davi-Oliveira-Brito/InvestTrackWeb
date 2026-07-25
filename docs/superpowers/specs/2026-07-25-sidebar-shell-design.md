# Shell de Navegação (Sidebar estilo CRM) — design

## Contexto

Primeiro item da Sprint 5 (Polimento) do `ROADMAP.md`: substituir a navegação avulsa que hoje existe em cada página autenticada (`/dashboard`, `/carteira`, `/metricas`, `/simulador` — cada uma reimplementa seus próprios botões de link + "Sair" no header) por uma sidebar compartilhada estilo CRM: seções fixas à esquerda, usuário/logout no rodapé.

**Achado que muda o spec:** a API não devolve `nome`/`email` em nenhum momento — `AuthResponse` (login e registro) só tem `{ token, expiraEm }` (confirmado no schema real do `/openapi/v1.json`). Não há endpoint de perfil (`GET /api/me` ou similar) na lista de endpoints documentada no `ROADMAP.md`. Decisão tomada com o usuário: guardar o `email` digitado no formulário de login/registro em `localStorage` junto da sessão, em vez de tentar decodificar o JWT (que exigiria confirmar claims não documentados do backend).

## Decisões (aprovadas com o usuário)

1. **Identidade do usuário**: `Session` (`src/lib/auth-storage.ts`) ganha `email: string` (sempre presente) e `nome?: string` (só presente quando a sessão nasceu de um registro neste navegador). Rodapé da sidebar mostra `nome ?? email`.
2. **Estrutura de rotas**: as 4 páginas autenticadas migram para um route group `src/app/(app)/`, com um único `layout.tsx` ali cobrindo `ProtectedRoute` + a sidebar — mesmo padrão que `(auth)` já usa hoje para `/login`/`/registro`. URLs não mudam (route group não aparece na URL).
3. **Header antigo removido**: cada página perde seu bloco de navegação/"Sair" duplicado (ex: o `<div className="flex gap-3">` do dashboard com "Minha carteira"/"Métricas"/"Simulador"/"Sair"), mantendo só o `<h1>` e o conteúdo. Navegação e logout passam a viver só na sidebar.
4. **Mobile**: já entra com collapse/hambúguer nesta spec (não fica só pro item de responsividade da Sprint 5, que cobre o restante do app — tabelas, formulários, etc.). Abaixo do breakpoint `md`, a sidebar fixa vira uma barra superior com botão de menu, que abre o mesmo nav num drawer lateral.
5. **Drawer mobile reaproveita o `Dialog` existente** (`@base-ui/react`, já usado no form de posição da carteira) em vez de um painel customizado — foco preso, Escape, clique-fora e backdrop já vêm prontos; só muda o posicionamento (lateral esquerda, não centralizado) via classes.
6. **Item ativo**: comparação de `usePathname()` com o `href` de cada item da sidebar, indicador visual na cor `primary` (lime), conforme o token `ex-app-shell-row` já documentado no `DESIGN-SYSTEM.md`.
7. **Sem teste automatizado** — mesmo critério dos sprints anteriores. Verificação = `tsc --noEmit` + `lint` + `build` + checagem manual do usuário no browser (dev server na porta 3000), incluindo testar o drawer mobile via devtools de responsividade.

## Arquitetura

### `src/lib/auth-storage.ts` (modificação)

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

(Uma sessão salva antes desta mudança não tem `email` gravado — `getSession` trata isso como sessão inválida, igual já trata token/expiraEm ausentes, forçando novo login. Não é uma regressão real: ninguém tem sessão de produção ainda, o app não foi usado por usuários reais.)

### `src/features/auth/auth-provider.tsx` (modificação)

`AuthContextValue` ganha `email: string | null` e `nome: string | null`, populados a partir da `Session` em `getSession()`/`login()`, do mesmo jeito que `token` já é hoje.

### `src/app/(auth)/login/page.tsx` e `src/app/(auth)/registro/page.tsx` (modificação)

Em vez de `setSession(result.data)`, passam a montar o objeto completo:
- Login: `setSession({ ...result.data, email })`
- Registro: `setSession({ ...result.data, email, nome })`

(`email`/`nome` já existem como `useState` nos dois formulários — só passam a entrar no objeto de sessão também, nenhum campo novo de formulário.)

### `src/features/app-shell/sidebar-nav.tsx` (novo)

- Lista fixa de 4 itens: `{ href: "/dashboard", label: "Dashboard" }`, `{ href: "/carteira", label: "Minha Carteira" }`, `{ href: "/metricas", label: "Métricas" }`, `{ href: "/simulador", label: "Simulador" }`.
- Cada item um `Link`, indicador de rota ativa via `usePathname()` comparado ao `href`, estilo conforme `ex-app-shell-row` (cor `primary` no indicador ativo).
- Rodapé: `nome ?? email` do `useAuth()` + botão "Sair" (chama `logout()`).
- Aceita uma prop `onNavigate?: () => void`, chamada no `onClick` de cada link — usada pelo drawer mobile pra se fechar ao navegar (no desktop, fica sem uso).

### `src/features/app-shell/app-shell.tsx` (novo)

- Client component. `isDrawerOpen` (`useState`).
- Desktop (`hidden md:flex`): coluna fixa à esquerda, `w-60 h-screen sticky top-0`, fundo `canvas`, contém `<SidebarNav />`.
- Mobile (`flex md:hidden`): barra superior com botão de menu (ícone `Menu` do `lucide-react`) que abre o `Dialog` existente (`@/components/ui/dialog`), posicionado à esquerda (classes custom no `DialogContent`, não centralizado) — dentro dele, `<SidebarNav onNavigate={() => setIsDrawerOpen(false)} />`.
- `{children}` renderiza ao lado (desktop) / abaixo (mobile) da sidebar, dentro de uma área com `flex-1`.

### `src/app/(app)/layout.tsx` (novo, substitui os 4 layouts individuais)

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

### Migração de pastas

- `src/app/dashboard/` → `src/app/(app)/dashboard/` (mesmo conteúdo de `page.tsx`, exceto o header de nav removido; `layout.tsx` deletado).
- `src/app/carteira/` → `src/app/(app)/carteira/` (idem).
- `src/app/metricas/` → `src/app/(app)/metricas/` (idem).
- `src/app/simulador/` → `src/app/(app)/simulador/` (idem — este já não tinha header de nav, só o `<h1>Simulador</h1>`, então não muda conteúdo).

## Fora de escopo (adiado)

- Responsividade do conteúdo de cada página (tabelas, formulários, grids) — item separado da Sprint 5, spec próprio.
- Dark mode da sidebar — item separado da Sprint 5 (dark mode), spec próprio.
- Indicador de contagem/badge nos itens da sidebar (ex: notificações) — não pedido.
- Colapsar a sidebar no desktop (modo "ícone só") — não pedido, escopo é só mobile vs desktop fixo.

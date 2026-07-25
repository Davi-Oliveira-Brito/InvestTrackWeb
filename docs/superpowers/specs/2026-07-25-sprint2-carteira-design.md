# Sprint 2 — Minha Carteira (design)

## Contexto

Sprint 2 do `ROADMAP.md`: CRUD de posições de investimento, consumindo a API já pronta (`https://investtrackapi.onrender.com`, spec em `/openapi/v1.json`). Critério de sucesso: cadastrar, editar e remover posições pelo front, refletindo no banco.

Schema real confirmado em `/openapi/v1.json` (não documentado à mão a partir do `ROADMAP.md`, que só descreve os campos por alto):

- `PosicaoResponse`: `id` (uuid), `ticker` (string), `nomeAtivo` (string), `tipo` (`TipoAtivo`: `"Acao" | "FII" | "RendaFixa"`), `quantidade` (`number | string`, decimal), `precoMedio` (`number | string`), `dataCompra` (date-time ISO), `precoAtual` (`number | string | null`), `precoAtualizadoEm` (`string | null`), `valorInvestido` (`number | string`), `valorAtual` (`number | string | null`), `rentabilidadeValor` (`number | string | null`), `rentabilidadePercentual` (`number | string | null`).
- `CriarPosicaoRequest` (`POST /api/carteira`, obrigatórios: `ticker, nomeAtivo, tipo, dataCompra`; `quantidade`/`precoMedio` também exigidos na prática pelo negócio): `ticker` (≤20 chars), `nomeAtivo` (≤200 chars), `tipo`, `quantidade` (mínimo `1e-8`), `precoMedio` (mínimo `0.01`), `dataCompra`.
- `EditarPosicaoRequest` (`PUT /api/carteira/{id}`, obrigatório no schema apenas `dataCompra`, mas o front sempre envia os três): `quantidade`, `precoMedio`, `dataCompra`. **Não inclui `ticker`/`nomeAtivo`/`tipo`** — a API não permite editar esses campos.
- `DELETE /api/carteira/{id}` → `200 OK`, sem corpo relevante.

`quantidade`/`precoMedio`/`precoAtual`/`valorAtual`/`rentabilidade*` são tipados como `number | string` no OpenAPI (reflexo de `decimal` do .NET serializado). O front deve normalizar com um helper de parsing antes de formatar/exibir.

**Suposição não verificável agora:** `rentabilidadePercentual` vem em pontos percentuais (`12.5` = 12,5%), não fração (`0.125`). Não há posição real com cotação calculada disponível pra confirmar (depende do job periódico de preço da API rodar sobre uma posição de teste). Se estiver errado, é um ajuste isolado no formatter (`src/lib/format.ts`).

## Decisões (aprovadas com o usuário)

1. **Rota:** `/carteira`, nova rota protegida, irmã de `/dashboard` (que continua placeholder até o Sprint 3). O placeholder do dashboard ganha um link pra `/carteira`.
2. **Criar/editar:** modal (`@base-ui/react/dialog`), não formulário fixo na página.
3. **Remover:** exige confirmação via `alert-dialog` antes do `DELETE`.

## Arquitetura

### Tipos — `src/types/carteira.ts`

```ts
export type TipoAtivo = "Acao" | "FII" | "RendaFixa"

export interface PosicaoResponse {
  id: string
  ticker: string
  nomeAtivo: string
  tipo: TipoAtivo
  quantidade: number | string
  precoMedio: number | string
  dataCompra: string
  precoAtual: number | string | null
  precoAtualizadoEm: string | null
  valorInvestido: number | string
  valorAtual: number | string | null
  rentabilidadeValor: number | string | null
  rentabilidadePercentual: number | string | null
}

export interface CriarPosicaoPayload {
  ticker: string
  nomeAtivo: string
  tipo: TipoAtivo
  quantidade: number
  precoMedio: number
  dataCompra: string // ISO date-time
}

export interface EditarPosicaoPayload {
  quantidade: number
  precoMedio: number
  dataCompra: string // ISO date-time
}
```

### Serviço — `src/services/carteira-service.ts`

Mesmo padrão de `auth-service.ts`, mas todas as chamadas exigem `token` (endpoints autenticados):

- `listPosicoes(token): Promise<ApiResult<PosicaoResponse[]>>` → `GET /api/carteira`
- `createPosicao(payload, token): Promise<ApiResult<PosicaoResponse>>` → `POST /api/carteira`
- `updatePosicao(id, payload, token): Promise<ApiResult<PosicaoResponse>>` → `PUT /api/carteira/{id}`
- `deletePosicao(id, token): Promise<ApiResult<void>>` → `DELETE /api/carteira/{id}`

### Validação — `src/features/carteira/validation.ts`

Espelha os limites da API (mesmo espírito de `src/features/auth/validation.ts`):

- `validateTicker`: obrigatório, ≤20 caracteres.
- `validateNomeAtivo`: obrigatório, ≤200 caracteres.
- `validateTipo`: obrigatório (um dos 3 valores).
- `validateQuantidade`: obrigatório, número > 0.
- `validatePrecoMedio`: obrigatório, número ≥ 0.01.
- `validateDataCompra`: obrigatório, data válida.

### Formatação — `src/lib/format.ts`

- `toNumber(value: number | string): number` — normaliza os campos decimais que podem vir como string.
- `formatCurrencyBRL(value: number | string | null): string` — `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`; retorna label de "cotação pendente" quando `null` (a decisão de exibir o placeholder fica no componente de tabela, não no formatter, pra manter o formatter puro).
- `formatPercent(value: number | string): string` — pt-BR, 2 casas decimais, assumindo valor já em pontos percentuais.
- `formatDateBR(value: string): string` — `toLocaleDateString('pt-BR')`.

Reutilizável nos Sprints 3 e 4 (resumo, métricas).

### Primitivos de UI novos (`src/components/ui/`)

Scaffold via `shadcn add dialog select table alert-dialog` (estilo `base-nova`, já configurado em `components.json`), ajustados aos tokens do `DESIGN-SYSTEM.md` (mesmo tratamento que `button.tsx`/`card.tsx` já receberam — radius `xl` 24px, paleta Wise).

- `dialog.tsx` — para o formulário de criar/editar.
- `alert-dialog.tsx` — para a confirmação de remoção.
- `select.tsx` — para o campo `tipo` (3 opções fixas, sem digitação livre).
- `table.tsx` — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, seguindo o spec `ex-data-table-cell` do design system (header eyebrow, corpo `body-sm`, `rowBorder`).

### Feature — `src/features/carteira/`

- `posicao-form-dialog.tsx` — modal client-side com `useState` de campos + validação, reaproveitando `Input`/`Label`/`FieldError`/`FormAlert` já existentes. Dois modos:
  - **Criar:** todos os campos editáveis (ticker, nome, tipo, quantidade, preço médio, data).
  - **Editar:** ticker/nome/tipo exibidos como somente leitura (a API não aceita editá-los); quantidade/preço médio/data editáveis.
  - Ao salvar com sucesso, fecha o modal e dispara recarregamento da lista (via callback do componente pai).
- `delete-posicao-dialog.tsx` — `alert-dialog` de confirmação ("Remover {ticker} da carteira?"); ao confirmar, chama `deletePosicao` e recarrega a lista.

### Página — `src/app/carteira/`

- `layout.tsx` — mesmo padrão do `dashboard/layout.tsx`: envolve `children` com `ProtectedRoute`.
- `page.tsx` — client component:
  - `useEffect` carrega `listPosicoes(token)` ao montar (e após cada mutação bem-sucedida — **sem update otimista**, sempre busca de novo da API pra garantir que a tela reflita o banco, que é o critério de sucesso do sprint).
  - Cabeçalho com título + botão "Adicionar posição" (abre `posicao-form-dialog` em modo criar).
  - Estado de carregamento inicial: texto simples ("Carregando..."), sem skeleton (polish fica pro Sprint 5).
  - Estado vazio (lista carregada e vazia): mensagem + botão de adicionar, sem tabela.
  - Tabela dentro de um `Card` branco sobre o canvas sage — mesma lógica de elevação por contraste de superfície já usada no resto do app.
  - Colunas: Ticker | Nome | Tipo | Quantidade | Preço médio | Preço atual | Valor atual | Rentabilidade | Ações (editar/remover).
  - `precoAtual`/`valorAtual`/rentabilidade `null` → célula "Cotação pendente" (texto `mute`), não tratado como erro.
  - Rentabilidade colorida com as cores semânticas (`positive`/`negative`) do `DESIGN-SYSTEM.md`.
  - Erros de rede/negócio ao carregar a lista: `FormAlert` reaproveitado, com botão de tentar novamente.

## Fora de escopo (adiado)

- Loading states refinados (skeletons, spinners) — Sprint 5.
- Responsividade da tabela em mobile além do básico (`overflow-x: auto`) — Sprint 5.
- Cards de resumo / gráfico de alocação — Sprint 3.
- Navegação/shell compartilhado entre páginas autenticadas — não pedido neste sprint; só um link simples `/dashboard` → `/carteira` é adicionado.

# Sprint 3 — Dashboard (design)

## Contexto

Sprint 3 do `ROADMAP.md`: cards de resumo (`GET /api/carteira/resumo`) + gráfico de pizza de alocação por tipo de ativo (`Acao`/`FII`/`RendaFixa`). Critério de sucesso: dashboard reflete os dados reais da carteira cadastrada.

Schema real confirmado em `/openapi/v1.json` (`CarteiraResumoResponse`):

- `quantidadePosicoes` (int, nunca null)
- `quantidadePosicoesSemCotacao` (int, nunca null)
- `valorTotalInvestido` (number, nunca null)
- `valorTotalAtual` (number | null)
- `rentabilidadeTotalValor` (number | null)
- `rentabilidadeTotalPercentual` (number | null)

**Confirmado:** o endpoint de resumo não traz nenhuma quebra por `tipo`. O gráfico de pizza precisa ser agregado no front a partir de `GET /api/carteira` (lista de posições), somando por `tipo`.

## Decisões (aprovadas com o usuário)

1. **Peso de cada fatia da pizza:** `valorAtual`, com fallback pro `valorInvestido` quando `valorAtual` vier `null` (cotação pendente). Garante que toda posição aparece na pizza desde o primeiro dia, sem esperar o job de preço (30 min) rodar.
2. **Layout:** duas colunas em desktop — cards de resumo empilhados à esquerda, card da pizza à direita. Empilha verticalmente no mobile (responsividade básica via flex/grid; polimento fino continua Sprint 5).
3. **Cards:** 4 cards — Valor Investido, Valor Atual, Rentabilidade, Posições.
4. **Estado vazio** (`quantidadePosicoes === 0`): sem cards nem pizza — card único centralizado "Você ainda não tem posições" + botão para `/carteira`, mesmo padrão do empty state que já existe lá.
5. **Biblioteca do gráfico:** nenhuma nova dependência. SVG desenhado à mão (arcos calculados a partir do ângulo acumulado por fatia), consistente com a decisão do Sprint 1 de não adicionar bibliotecas além do estritamente necessário.
6. **Paleta categórica da pizza:** validada via skill de dataviz (seis checks: banda de luminosidade, piso de croma, separação CVD par-a-par — incluindo o teste "todos contra todos", já que numa pizza toda fatia é vizinha de todas as outras — contraste e documentação). Os tokens de ilustração já existentes no design system (`accent-orange`, `accent-cyan`) falharam na validação (muito claros/baixa saturação para carregar identidade), e o verde `primary` é reservado para CTA. Adotada a trinca padrão do skill, já validada nos dois modos:
   - `Acao` → azul `#2a78d6` (claro) / `#3987e5` (escuro)
   - `FII` → laranja `#eb6834` (claro) / `#d95926` (escuro)
   - `RendaFixa` → aqua `#1baf7a` (claro) / `#199e70` (escuro)
   - Mapeamento **fixo** por tipo (nunca cor calculada dinamicamente por posição/índice).
   - Dark mode fora de escopo neste sprint (Sprint 5, roadmap já formaliza) — hexadecimais escuros só ficam documentados aqui para uso futuro, sem toggle implementado agora.
7. **Sem teste automatizado** — mesmo critério dos sprints 1 e 2 (nenhum framework instalado, não exigido pelo `ROADMAP.md`). Verificação = `tsc --noEmit` + `lint` + `build` + checagem manual do usuário no browser (dev server obrigatoriamente na porta 3000, por causa do CORS local).

## Arquitetura

### Tipos — `src/types/carteira.ts` (adição)

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

### Serviço — `src/services/carteira-service.ts` (adição)

```ts
export function getResumo(token: string): Promise<ApiResult<ResumoResponse>> {
  return httpClient.get<ResumoResponse>("/api/carteira/resumo", token)
}
```

Mesmo padrão de `listPosicoes` (endpoint autenticado, `ApiResult`).

### Agregação — `src/features/dashboard/aggregate-by-tipo.ts`

Função pura, sem chamada de rede:

```ts
export interface AlocacaoTipo {
  tipo: TipoAtivo
  label: string       // "Ação" | "FII" | "Renda Fixa" (de TIPO_LABELS)
  value: number        // soma em R$
  percent: number       // 0-100, relativo ao total das 3 fatias
  color: string         // hex fixo por tipo
}

export function aggregateByTipo(posicoes: PosicaoResponse[]): AlocacaoTipo[]
```

- Para cada posição, peso = `toNumber(posicao.valorAtual ?? posicao.valorInvestido)`.
- Agrupa por `tipo`, soma os pesos.
- Descarta tipos com soma `0` (não aparecem nem no gráfico nem na legenda).
- Calcula `percent` sobre o total das fatias remanescentes.
- Ordem de retorno sempre fixa (`Acao`, `FII`, `RendaFixa` — filtrando os ausentes), nunca por tamanho da fatia — mantém a cor sempre ligada à identidade do tipo, nunca ao ranking.

### Componente — `src/features/dashboard/resumo-cards.tsx`

- Recebe `resumo: ResumoResponse` via props.
- 4 `Card`: Valor Investido (`formatCurrencyBRL(valorTotalInvestido)`), Valor Atual (`valorTotalAtual === null` → "Cotação pendente"), Rentabilidade (valor + `formatPercent`, cor `positive`/`negative` conforme sinal, ou "Cotação pendente" se null), Posições (`quantidadePosicoes`, com nota "N aguardando cotação" se `quantidadePosicoesSemCotacao > 0`).
- Reaproveita `formatCurrencyBRL`/`formatPercent`/`toNumber` de `src/lib/format.ts` — nenhum helper novo de formatação.

### Componente — `src/features/dashboard/allocation-pie-chart.tsx`

- Recebe `alocacao: AlocacaoTipo[]` via props.
- SVG com um `<path>` de arco por fatia (raio fixo, centro fixo), ângulo inicial/final acumulado a partir de `percent`. Cada `<path>` tem um `<title>` filho com texto `"{label} — {formatCurrencyBRL(value)} ({formatPercent(percent)})"` como tooltip nativo.
- Legenda abaixo do SVG: uma linha por item de `alocacao` — quadrado de cor (`background-color` inline com o hex do item) + `label` + `formatPercent(percent)`.
- Se `alocacao` vier vazio (não deveria acontecer fora do estado vazio geral, mas defensivamente), não renderiza nada — o componente pai decide o estado vazio.

### Página — `src/app/dashboard/page.tsx` (reescrita do placeholder)

- Client component. `useCallback` + `useEffect` disparando `Promise.all([getResumo(token), listPosicoes(token)])` ao montar.
- Estados: `isLoading`, `loadError`, `resumo`, `posicoes`.
- Se qualquer uma das duas chamadas falhar: `loadError` setado, `FormAlert` + botão "Tentar novamente" (reexecuta as duas).
- Se `resumo.quantidadePosicoes === 0`: estado vazio (card centralizado + botão para `/carteira`), sem renderizar cards/pizza.
- Caso contrário: layout 2 colunas (`ResumoCards` à esquerda, `AllocationPieChart` à direita, alimentado por `aggregateByTipo(posicoes)`), empilhando em mobile.
- Mantém o botão "Sair" (logout) que já existe no placeholder atual.

## Fora de escopo (adiado)

- Dark mode do gráfico (hex já documentado acima, toggle fica pro Sprint 5).
- Loading states refinados (skeleton) e responsividade fina além do empilhamento básico — Sprint 5.
- Tooltip customizado além do `<title>` nativo do SVG.
- Qualquer biblioteca de gráfico (Recharts/shadcn chart) — decisão explícita de não adicionar dependência nova para um gráfico estático de 3 fatias.

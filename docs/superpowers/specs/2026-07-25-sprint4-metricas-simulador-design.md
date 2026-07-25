# Sprint 4 — Métricas e Simulador (design)

## Contexto

Sprint 4 do `ROADMAP.md`: duas partes, tratadas como um spec só a pedido do usuário (mesmo sendo subsistemas independentes — não compartilham estado nem endpoint):

1. **Métricas**: comparação da carteira com CDI/Ibovespa via `GET /api/carteira/metricas`.
2. **Simulador**: "e se eu tivesse investido X em Y na data Z" via `POST /api/simulacao`.

Schema real confirmado em `/openapi/v1.json`:

- **`CarteiraMetricasResponse`**: `diasConsiderados` (int), `volatilidadeAnualizada` (number), `retornoAnualizadoCarteira` (number), `sharpeRatio` (number), `drawdownMaximo` (number), `retornoAnualizadoCdi` (number), `retornoAnualizadoIbovespa` (number | **null**, mesmo num `200` de sucesso — cai pra `null` quando só a cotação do Ibovespa falha, sem invalidar o resto).
  - **Achado que muda o Sprint:** o `ROADMAP.md` pede "gráfico de linha", mas esse endpoint **não tem nenhuma série temporal** — são 6 números pontuais. Não existe "linha ao longo do tempo" pra desenhar. Decisão tomada com o usuário: comparação de retorno anualizado vira **barras horizontais** (3 categorias comparadas num instante só — é exatamente o caso de uso de bar chart, não de line chart), e as 3 métricas de risco (volatilidade/Sharpe/drawdown) viram stat tiles separados.
- **`SimulacaoRequest`** (`POST /api/simulacao`): só `ticker` (≤20 chars) e `dataInvestimento` (obrigatórios pelo schema). `valorInvestido` (mínimo `0.01`) é opcional pela API — decisão tomada com o usuário: **obrigatório no front**, porque o simulador só faz sentido com um valor de referência pra comparar.
- **`SimulacaoResponse`**: `ticker`, `valorInvestido`, `dataInvestimento`, `precoNaData`, `precoAtual`, `valorAtual`, `rentabilidadeValor`, `rentabilidadePercentual` (nenhum desses vem `null` na resposta de sucesso).

## Decisões (aprovadas com o usuário)

1. **Rotas**: duas páginas novas, `/metricas` e `/simulador`, cada uma com seu `layout.tsx` (`ProtectedRoute`, mesmo padrão de `/carteira` e `/dashboard`). Sem sidebar ainda (isso é Sprint 5) — o dashboard ganha mais dois links avulsos, junto do "Minha carteira" que já existe.
2. **Gráfico de Métricas**: barras horizontais, não linha. Cor categórica fixa por série (`Carteira`/`CDI`/`Ibovespa`), reaproveitando a mesma trinca validada do Sprint 3 (azul `#2a78d6` / laranja `#eb6834` / aqua `#1baf7a`) — mapeamento diferente do da pizza de alocação (lá é por `tipo` de ativo), mas são gráficos em páginas diferentes, nunca lado a lado, então não há conflito de leitura. Rótulo percentual direto em cada barra.
3. **`retornoAnualizadoIbovespa: null`**: a barra do Ibovespa vira uma linha de texto "Ibovespa — indisponível" (`text-mute`), sem barra, em vez de quebrar o gráfico ou esconder a série.
4. **Erros de Métricas**: `400` (carteira vazia) → mesmo empty-state já usado no dashboard (card + botão para `/carteira`). `503` (histórico insuficiente / API externa fora do ar) → `FormAlert` com mensagem específica + botão "Tentar novamente", distinta do erro genérico.
5. **Extensão no `http-client.ts`**: hoje `ApiError` só carrega `kind` (`business`/`validation`/`rate-limited`/`unexpected`/`network`), sem o status HTTP — suficiente pra tudo que já existe. Aqui, `400` e `503` provavelmente chegam no mesmo formato `{ message: "..." }` e cairiam ambos em `kind: "business"`, indistinguíveis. Decisão: adicionar campo opcional `status?: number` em `ApiError`, populado em `parseErrorBody`/`request()` — mudança aditiva, não quebra nenhum call site existente que só olha `kind`.
6. **Ticker do simulador**: texto livre (input normal, maiúsculas automáticas, até 20 caracteres) com uma dica abaixo do campo ("Hoje só PETR4, MGLU3, VALE3 e ITUB4 têm cotação disponível em produção"), não um select travado — continua funcionando sem mudança de código quando o token do Brapi for configurado no Render e mais tickers passarem a funcionar.
7. **Resultado do simulador**: `Card` abaixo do formulário, só aparece após um submit com sucesso; um novo submit substitui o resultado anterior (sem histórico de simulações).
8. **Erro 404 do simulador** (ticker sem cotação pra aquela data): mensagem específica atrelada ao formulário ("Não encontramos cotação para esse ticker na data informada."), não um erro de página inteira.
9. **Sem teste automatizado** — mesmo critério dos sprints anteriores. Verificação = `tsc --noEmit` + `lint` + `build` + checagem manual do usuário no browser (dev server na porta 3000).

## Arquitetura

### `src/types/api.ts` (modificação)

```ts
export type ApiError =
  | { kind: "validation"; errors: ValidationErrors; status?: number }
  | { kind: "business"; message: string; status?: number }
  | { kind: "rate-limited"; status?: number }
  | { kind: "unexpected"; message: string; status?: number }
  | { kind: "network" }
```

`status` é opcional e não usado por nenhum call site existente — só as páginas de Métricas vão ler `error.status` pra diferenciar `400` de `503`.

### `src/services/http-client.ts` (modificação)

`parseErrorBody` passa a receber e propagar o `status` em cada variante retornada (hoje já recebe `status` como parâmetro, só não o inclui no objeto de erro). `request()` também passa `status: response.status` no branch de `429` (`rate-limited`).

### Tipos — `src/types/carteira.ts` (adição)

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

### Tipos — `src/types/simulacao.ts` (novo arquivo)

```ts
export interface SimulacaoPayload {
  ticker: string
  valorInvestido: number
  dataInvestimento: string // ISO date-time
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

### Serviço — `src/services/carteira-service.ts` (adição)

```ts
export function getMetricas(token: string): Promise<ApiResult<MetricasResponse>> {
  return httpClient.get<MetricasResponse>("/api/carteira/metricas", token)
}
```

### Serviço — `src/services/simulacao-service.ts` (novo arquivo)

```ts
export function postSimulacao(
  payload: SimulacaoPayload,
  token: string
): Promise<ApiResult<SimulacaoResponse>> {
  return httpClient.post<SimulacaoResponse>("/api/simulacao", payload, token)
}
```

### Validação — `src/features/simulador/validation.ts` (novo arquivo)

Mesmo espírito de `features/carteira/validation.ts`:

- `validateTicker`: obrigatório, ≤20 caracteres.
- `validateValorInvestido`: obrigatório, número ≥ 0.01.
- `validateDataInvestimento`: obrigatório, data válida.

### Componente — `src/features/metricas/retorno-bar-chart.tsx`

- Recebe as 3 métricas de retorno já normalizadas via props (`{ label, value, color }[]`, mesmo formato de forma que `AlocacaoTipo` no Sprint 3, mas sem a etapa de agregação — os 3 valores já vêm prontos do `MetricasResponse`).
- Barra horizontal por item: `<div>` com largura proporcional ao valor (escala compartilhada entre as 3, ancorada em zero — retorno pode ser negativo, então a barra cresce pra direita ou esquerda a partir de uma baseline central), cor categórica fixa, rótulo do percentual direto ao lado.
- Item com valor `null` (caso do Ibovespa indisponível) renderiza só o texto "indisponível" em `text-mute`, sem barra.

### Componente — `src/features/metricas/metricas-stat-tiles.tsx`

- 3 `Card`: Volatilidade Anualizada, Sharpe Ratio, Drawdown Máximo — mesmo padrão visual dos cards do dashboard (`ResumoCards`).
- Legenda pequena abaixo dos tiles: "Baseado em {toNumber(diasConsiderados)} dias de histórico" (usa `toNumber` de `lib/format.ts` antes de exibir, já que o campo pode vir como string da API).

### Página — `src/app/metricas/page.tsx`

- Client component. `useEffect` chama `getMetricas(token)` ao montar (mesmo padrão de fetch das páginas anteriores).
- `error.status === 400` → empty-state (card + botão `/carteira`).
- `error.status === 503` → `FormAlert` com mensagem específica + retry.
- Qualquer outro erro → `FormAlert` genérico + retry (mesmo padrão das outras páginas).
- Sucesso → `RetornoBarChart` (Carteira/CDI/Ibovespa) + `MetricasStatTiles`.

### Componente — `src/features/simulador/simulador-form.tsx`

- Formulário client-side com `useState` (sem lib nova, mesmo padrão de login/registro/carteira): `ticker`, `valorInvestido`, `dataInvestimento`.
- Validação client-side via `features/simulador/validation.ts`, exibição de erro do servidor sem duplicar mensagem (mesmo padrão dos formulários anteriores).
- Submissão desabilita o botão enquanto a chamada está em andamento.
- Erro `404` → mensagem específica atrelada ao formulário. Outros erros → `FormAlert` genérico.
- Em caso de sucesso, chama um callback `onResult(SimulacaoResponse)` do componente pai (a página) — o formulário não guarda o resultado, só dispara o evento.

### Componente — `src/features/simulador/simulacao-result-card.tsx`

- Recebe `resultado: SimulacaoResponse` via props.
- `Card` mostrando: preço na data vs preço atual, valor investido → valor atual, rentabilidade (valor + %, cor `positive`/`negative` conforme sinal) — mesmos helpers de `lib/format.ts` já usados no resto do app.

### Página — `src/app/simulador/page.tsx`

- Client component. Sem fetch ao montar (só reage ao submit do formulário).
- Estado `resultado: SimulacaoResponse | null` — populado pelo callback `onResult` do `SimuladorForm`.
- Renderiza `SimuladorForm` sempre, e `SimulacaoResultCard` só quando `resultado !== null`.

### `src/app/dashboard/page.tsx` (modificação)

- Adiciona mais dois `Button` com `render={<Link>}` ao lado do "Minha carteira" já existente: "Métricas" (`/metricas`) e "Simulador" (`/simulador`).

## Fora de escopo (adiado)

- Sidebar/shell de navegação — Sprint 5 (já registrado no roadmap).
- Histórico de simulações anteriores — YAGNI, cada submit substitui o resultado.
- Select travado nos 4 tickers testáveis — texto livre com dica é a decisão tomada.
- Qualquer biblioteca de gráfico — barras seguem o mesmo padrão de HTML/CSS simples do Sprint 3 (sem SVG necessário aqui, já que são barras retangulares simples via `<div>` com largura proporcional, mais simples que os arcos da pizza).
- Correção do padrão de fetch (`react-hooks/set-state-in-effect`) usado em `/metricas` — mesmo gap já registrado no Sprint 5 do roadmap, `/metricas` só repete o padrão existente, não piora nem resolve.

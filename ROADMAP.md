# InvestTrack Web — Roadmap de Desenvolvimento

Front-end da plataforma de análise de portfólio de investimentos. Consome a API do InvestTrack (backend já 100% completo) para permitir cadastro de carteira, acompanhamento de rentabilidade, métricas de risco e comparação com benchmarks.

> Este documento serve tanto de guia de progresso quanto de contexto para sessões com IA de código (Claude Code). Antes de iniciar qualquer sprint, leia a seção **"Contexto da API"** por completo.

## Links de referência

| O quê | Link |
|---|---|
| API em produção | https://investtrackapi.onrender.com |
| Documentação interativa (Scalar) | https://investtrackapi.onrender.com/scalar/v1 |
| API local (padrão) | http://localhost:5158 |
| Repositório da API | https://github.com/Davi-Oliveira-Brito/InvestTrackApi |
| Repositório deste front | https://github.com/Davi-Oliveira-Brito/InvestTrackWeb |
| Banco de dados (Supabase) | via painel do Supabase, projeto `investtrack` |

## Stack

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** shadcn/ui (preset Nova — Lucide/Geist)
- **Deploy:** Vercel

---

## Contexto da API (backend já completo)

### Autenticação

JWT Bearer. Token expira em **2 horas** — sem refresh token (cortado de escopo no backend deliberadamente).

- `POST /api/auth/register` — body: `{ nome, email, password }`. Senha exige mínimo 8 caracteres, pelo menos 1 letra e 1 número.
- `POST /api/auth/login` — body: `{ email, password }`.
- Resposta de ambos: `{ token, expiraEm }`.
- Demais endpoints exigem header `Authorization: Bearer <token>`.

### Endpoints disponíveis

| Método | Rota | O que faz | Observações |
|---|---|---|---|
| POST | `/api/auth/register` | Cria conta | — |
| POST | `/api/auth/login` | Login | — |
| GET | `/api/carteira` | Lista posições | Campos `precoAtual`, `valorAtual`, `rentabilidadeValor`, `rentabilidadePercentual` podem vir `null` |
| GET | `/api/carteira/resumo` | Totais da carteira | `valorTotalAtual`/`rentabilidadeTotal*` também podem vir `null` |
| GET | `/api/carteira/metricas` | Volatilidade, Sharpe, drawdown, comparação CDI/Ibovespa | Pode retornar `400` (carteira vazia) ou `503` (histórico insuficiente/API externa fora do ar) |
| POST | `/api/carteira` | Adiciona posição | body: `{ ticker, nomeAtivo, tipo, quantidade, precoMedio, dataCompra }` |
| PUT | `/api/carteira/{id}` | Edita posição | body: `{ quantidade, precoMedio, dataCompra }` (não edita ticker) |
| DELETE | `/api/carteira/{id}` | Remove posição | — |
| POST | `/api/simulacao` | "E se eu tivesse investido X em Y na data Z" | body: `{ ticker, valorInvestido, dataInvestimento }`. Retorna `404` se o ticker não existir/não tiver cotação |

### Coisas que o front PRECISA saber

1. **`tipo` do ativo só aceita 3 strings exatas (case-sensitive):** `"Acao"`, `"FII"`, `"RendaFixa"`. É um select fixo, não campo livre.
2. **Preço atual não é em tempo real.** Job em background atualiza a cada 30 min. Ticker recém-adicionado pode ter `precoAtual: null` até o próximo ciclo — tratar como "cotação pendente", não como erro.
3. **Ownership retorna 404, não 403** ao tentar editar/deletar posição de outro usuário (proposital, evita vazar existência do recurso).
4. **Rate limiting existe.** Global: 100 req/min por IP. Em `/api/auth`: 10 req/min por IP. Estourou, vem `429 Too Many Requests` — tratar esse status explicitamente (ex: "muitas tentativas, aguarde um pouco").
5. ⚠️ **CORS em produção AINDA NÃO libera o domínio do front.** `Cors:AllowedOrigins` em produção está vazio hoje. **Bloqueador real**: assim que este front for deployado na Vercel, é preciso configurar `Cors__AllowedOrigins__0` no Render com a URL da Vercel, senão o navegador bloqueia tudo. Localmente já libera `http://localhost:3000`.
6. ⚠️ **BRAPI (cotações) sem token em produção.** Só 4 tickers funcionam hoje: `PETR4`, `MGLU3`, `VALE3`, `ITUB4`. Testar o front com esses 4 primeiro. Configurar `Brapi__Token` no Render é passo futuro, fora do escopo deste front.
7. **Formatos de erro variam:** `400` de validação vem como `errors: { campo: [mensagens] }`; erros de negócio (email duplicado, posição não encontrada) vêm como `{ message: "..." }`. O client HTTP precisa lidar com os dois formatos.
8. **Erros inesperados (bug real):** `ProblemDetails` genérico (`{ title, status, detail }`), status 500, sem stack trace.

### Decisões já tomadas

- **Token guardado em `localStorage`** (não cookie httpOnly). Trade-off consciente por simplicidade/prazo — não é o ideal de segurança "nível produção bancária", mas é defensável para o escopo do projeto.
- **Design system:** ver `DESIGN-SYSTEM.md` na raiz do projeto (paleta, tipografia, Do's e Don'ts) antes de implementar qualquer tela.
- **Convenção de commit:** commits devem ser feitos normalmente pela ferramenta de IA usada (Claude Code), mas **sem** atribuição de co-autoria (ex: sem rodapé "Co-Authored-By: Claude"). A IA não é listada como contribuinte do projeto.

---

## Sprints

### Sprint 1 — Home (Landing) + Autenticação (Login/Registro)

- [x] Home (`/`): landing simples — Hero (headline + subtítulo curto) + CTA duplo ("Entrar" / "Criar conta"). Sem seções extras (features, prova social, etc.) por agora — foco é o produto funcionar, landing elaborada fica para o polimento (Sprint 5) se sobrar tempo.
- [x] Camada de serviço (`src/services/`): cliente HTTP centralizado, URL base via `NEXT_PUBLIC_API_URL` (fallback `http://localhost:5158`), tratamento dos dois formatos de erro e do `429`
- [x] Tela de Registro: formulário (nome, email, senha), validação client-side espelhando as regras da API, exibição de erro do servidor sem duplicar mensagem
- [x] Tela de Login: formulário (email, senha)
- [x] Armazenamento do token em `localStorage`, redirecionamento pós-login/registro
- [x] Rota protegida: redirecionar para login se não houver token válido

**Critério de sucesso:** acessar a Home, navegar para login/registro, criar conta e logar, token salvo, navegação protegida funcionando.

---

### Sprint 2 — Minha Carteira

- [x] Formulário de adicionar posição (`POST /api/carteira`) — ticker, nome, tipo (select fixo: Acao/FII/RendaFixa), quantidade, preço médio, data da compra
- [x] Tabela listando posições (`GET /api/carteira`) — tratar `null` em preço/rentabilidade como "cotação pendente"
- [x] Editar posição (`PUT /api/carteira/{id}`)
- [x] Remover posição (`DELETE /api/carteira/{id}`)

**Critério de sucesso:** cadastrar, editar e remover posições pelo front, refletindo no banco.

---

### Sprint 3 — Dashboard

- [x] Cards de resumo (`GET /api/carteira/resumo`) — valor total, rentabilidade (tratar `null`)
- [x] Gráfico de pizza — alocação por ativo/classe (`tipo`)

**Critério de sucesso:** dashboard reflete os dados reais da carteira cadastrada.

---

### Sprint 4 — Métricas e Simulador

- [ ] Gráfico de linha — carteira vs CDI vs Ibovespa (`GET /api/carteira/metricas`), tratando `400` (carteira vazia) e `503` (indisponibilidade) com mensagens claras na UI
- [ ] UI do simulador de cenário (`POST /api/simulacao`) — tratar `404` (ticker sem cotação)

**Critério de sucesso:** mostrar comparação com benchmark e rodar uma simulação de ponta a ponta, usando os tickers testáveis (`PETR4`, `MGLU3`, `VALE3`, `ITUB4`).

---

### Sprint 5 — Polimento

- [ ] Loading states em todas as chamadas assíncronas
- [ ] Responsividade (mobile/desktop)
- [ ] Dark mode
- [ ] README do front atualizado com setup e prints/gif de demo
- [ ] Shell de navegação estilo CRM — sidebar com as seções (Dashboard/Carteira/etc.) e usuário no rodapé, substituindo a navegação avulsa link-a-link que existe hoje entre as páginas autenticadas
- [ ] Corrigir o padrão de fetch client-side (`useEffect` chamando uma função que faz `setState`) usado em `/carteira` e `/dashboard` para satisfazer a regra de lint `react-hooks/set-state-in-effect` — hoje falha em ambas as páginas (nunca foi de fato verificado limpo desde o Sprint 2); resolver uma vez, de forma consistente, para todas as páginas autenticadas

**Critério de sucesso:** navegar o app inteiro sem tela quebrada, em qualquer tamanho de tela.

---

## CI/CD do front

Diferente do backend (que precisou de Deploy Hook porque o Render não valida nada antes de subir), a **Vercel já builda de forma "gated" nativamente**: todo PR gera um preview deploy real (se o build quebrar, aparece na hora, sem precisar de GitHub Actions pra isso), e o merge na `main` só fica no ar em produção se o build passar. Ou seja, conectar o repositório na Vercel já entrega o essencial do CI/CD sem configuração extra.

- [ ] Opcional (Sprint 5, polimento): adicionar um workflow simples de GitHub Actions rodando lint + type-check em cada PR, como checagem de qualidade adicional antes mesmo do build da Vercel.

## Pendências de infraestrutura (fora do código do front)

- [x] Configurar `Cors__AllowedOrigins__0` no Render com a URL da Vercel assim que o front for deployado
- [x] Deploy do front na Vercel
- [ ] (Opcional, futuro) Configurar `Brapi__Token` no Render para liberar mais tickers além dos 4 testáveis hoje

## Log de progresso

### Sprint 1
- Status: concluído (2026-07-25)
- Rota protegida (`/dashboard`) implementada como guard client-side (`ProtectedRoute`), já que a sessão vive em `localStorage` e não em cookie — Proxy/Middleware do Next não teria acesso a ela.
- `/dashboard` por enquanto é placeholder; conteúdo real entra no Sprint 3.

### Sprint 2
- Status: concluído (2026-07-25)
- Shipped via PR #2 (`sprint-2-carteira` → `main`), incluindo fix de label acentuado no select de tipo.

### Sprint 3
- Status: concluído (2026-07-25)
- Gráfico de pizza é SVG desenhado à mão (sem biblioteca nova), com paleta categórica de 3 cores validada via skill de dataviz (banda de luminosidade, piso de croma, separação CVD par-a-par, contraste).
- Peso de cada fatia usa `valorAtual`, com fallback pro `valorInvestido` quando a cotação ainda está pendente.
- Ver spec completo em `docs/superpowers/specs/2026-07-25-sprint3-dashboard-design.md`.

### Sprint 4
- Status: não iniciado

### Sprint 5
- Status: não iniciado
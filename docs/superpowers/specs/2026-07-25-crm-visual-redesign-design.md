# Redesign visual da área logada (CRM) — design

## Contexto

Redesign visual completo da área logada do InvestTrack (`/dashboard`, `/carteira`, `/metricas`, `/simulador` — tudo dentro do route group `src/app/(app)/`), seguindo dois documentos que o usuário escreveu na raiz do projeto:

- **`DESIGN-SYSTEM.md`** — paleta oliva/limão (baseada no design da AbacatePay, rotacionada de verde pra amarelo), tipografia (Fustat para headings/botões/links, Inter Tight para corpo), ícones Lucide.
- **`CRM.md`** — referência estrutural específica pra área logada: sidebar (2 estados + rodapé), 3 padrões de card, botões (radius 8px, não pill), popovers (único lugar com sombra), tabelas.

**Fora de escopo, confirmado com o usuário:** `src/app/page.tsx` (Home), `src/app/(auth)/login`, `src/app/(auth)/registro` — nenhum desses é tocado, nem visualmente nem no código.

## Decisão de arquitetura: escopo sem vazar pra fora

Vários primitivos compartilhados (`Button`, tokens de cor em `globals.css`) também são usados pelo Home/login/registro. Pra garantir que essas telas continuem **pixel-idênticas** sem precisar editá-las:

1. **Cores e fontes**: escopadas via atributo `data-app-shell` no elemento raiz do `AppShell` (`src/features/app-shell/app-shell.tsx`), com um bloco `[data-app-shell] { ... }` em `globals.css` redefinindo as mesmas variáveis CSS que os componentes já consomem (`--ink`, `--canvas-soft`, `--primary`, `--body`, `--mute`, `--positive`, `--negative`, `--border`, `--ring`, `--font-heading`, `--font-sans`) — mesmo mecanismo que o `.dark` já usa hoje neste arquivo (nunca usado, mas já é o padrão estabelecido). `:root` continua com os valores Wise antigos (serve só Home/login/registro).
2. **Radius do `Button`**: `[data-app-shell] [data-slot="button"] { border-radius: 8px }` — mesmo mecanismo, escopado pelo `data-slot` que o componente já expõe. Zero mudança em `button.tsx`.
3. **`Card`, `Select`, `Dialog`, `AlertDialog`, `Table`**: confirmado que hoje só são consumidos dentro da área logada (login/registro usam `Card` só como moldura do formulário, na variante `content`, que não é tocada — ganham variantes novas). `Select`/`Dialog`/`AlertDialog`/`Table` podem ser editados direto, sem risco de vazamento.
4. **Cores de gráfico (pizza de alocação, barras de retorno)**: são hex literais escritos direto no código (`CORES_POR_TIPO` em `aggregate-by-tipo.ts`, cores inline em `metricas/page.tsx`), não variáveis CSS — não são pegas pelo mecanismo de escopo acima. Precisam ser trocadas manualmente pelas "cores de apoio" do novo `DESIGN-SYSTEM.md`.

## Mapeamento de tokens (`:root` atual → `[data-app-shell]` novo)

| Token | Valor atual (Wise, `:root`) | Valor novo (área logada) | Origem |
|---|---|---|---|
| `--canvas` | `#ffffff` | `#ffffff` (sem mudança) | Branco — cards/superfícies |
| `--canvas-soft` | `#e8ebe6` | `#F6F6F0` | "Fundo cinza claro" — bg do app shell inteiro (sidebar + conteúdo), moldura dos cards de métrica |
| `--ink` | `#0e0f0c` | `#1C1B10` | "Quase-preto" — headings, nav ativo, chip ativo (CRM.md usa esse tom pro H1 da página, não o "oliva escuro" do DESIGN-SYSTEM.md genérico — a doc estrutural é mais específica pra esse contexto) |
| `--body` | `#454745` | `#807A47` | "Cinza-oliva" — texto secundário/parágrafos |
| `--mute` | `#868685` | `#807A47` | Mesmo cinza-oliva — o novo sistema não define um 3º tom de cinza separado do "body"; colapsa os dois níveis antigos em um |
| `--positive` | `#2ead4b` | `#22C55E` | Verde, `rgb(34,197,94)` — cor de apoio p/ ganho |
| `--negative` | `#d03238` | `#EF4444` | Vermelho, `rgb(239,68,68)` — cor de apoio p/ perda |
| `--primary` | `#9fe870` | `#EAE668` | Limão claro — CTA/destaque |
| `--primary-active` | `#cdffad` | `#D6D02E` | Limão forte — hover/estado ativo |
| `--primary-pale` | `#e2f6d5` | `#F8F7D4` | Limão suave — badges/seções |
| `--border` | `#0e0f0c` (= ink) | `#EDECDF` | "Cinza claro (bordas)" — toda borda de card/input/select/botão secundário. Mudança grande de estilo (borda escura e forte → hairline claro), é exatamente a intenção do redesign |
| `--ring` | `#9fe870` | `#EAE668` | Segue o novo primary, mesma convenção de antes |

**Deliberadamente não mapeados** (documentado aqui pra não parecer esquecimento):
- `--ink-deep`, `--positive-deep`, `--negative-deep`, `--negative-darkest`, `--negative-bg`, `--primary-neutral`: o novo `DESIGN-SYSTEM.md` não define tons "deep"/pressed pras cores de apoio, e nenhum componente hoje realmente consome essas classes (`text-positive-deep` etc. nunca foram escritas no código) — sem uso, sem necessidade de mapear.
- `--warning`, `--warning-deep`, `--warning-content`: o novo sistema não define uma cor de alerta/warning, e nenhum componente atual usa `bg-warning`/`text-warning`. Fica sem override (inerte).
- `--accent-orange`, `--accent-cyan`: substituídos pelas 6 "cores de apoio" do novo sistema, mas essas não são variáveis CSS — ver decisão 4 acima, tratadas como constantes no código dos gráficos.

**Fontes** (`[data-app-shell]` override de `--font-heading`/`--font-sans`):
- `--font-heading` → Fustat (peso 600 em headings/nav/botões via classe `font-heading`, já usada em todo H1 existente)
- `--font-sans` → Inter Tight (corpo, herda do `<body>` que já usa `font-sans` via `@layer base`)
- Carregadas em `src/app/layout.tsx` junto das fontes atuais (Geist/Inter continuam carregadas e em uso — servem Home/login/registro, que ficam fora do escopo `[data-app-shell]`).
- Confirmado: **Fustat** e **Inter Tight** existem no catálogo do `next/font/google` desta versão do Next (pesos 400/600/500 disponíveis nos dois — testado direto contra o metadata da lib).

## Decisões (aprovadas com o usuário)

1. **Sidebar mantém os 4 itens** (Dashboard/Carteira/Métricas/Simulador) — o `CRM.md` lista só 3 como exemplo ilustrativo da estrutura, não uma lista exaustiva.
2. **Overlay escuro do drawer mobile** (`bg-black/50`, CRM.md 2.1) é aplicado só no `Dialog` do `AppShell` via className específico — os modais de formulário (criar/editar/remover posição) continuam com o overlay claro atual (`bg-black/10`), sem tocar em `dialog.tsx` compartilhado.
3. **Item ativo da sidebar usa `bg-primary` direto** (limão claro sólido), não `bg-primary-pale` como a implementação atual (Sprint 5) — CRM.md 2.3 é explícito: fundo do item ativo é a cor de marca cheia, não um tint suave.
4. **Cores de gráfico**: pizza de alocação (`Acao`/`FII`/`RendaFixa`) e barras de retorno (`Carteira`/`CDI`/`Ibovespa`) trocam os hex atuais (paleta validada via skill de dataviz no Sprint 3/4) por 3 das "cores de apoio" do `DESIGN-SYSTEM.md`: **azul `#3B82F6`, roxo `#A855F7`, teal `#14B8A6`** (nessa ordem, mesma trinca nos dois gráficos — nunca aparecem lado a lado na tela, então não há risco de confundir identidade entre eles, mesmo raciocínio já usado no Sprint 4 pra reaproveitar a paleta da pizza nas barras). Verde/vermelho do conjunto de 6 ficam de fora do uso categórico — o próprio `DESIGN-SYSTEM.md` já reserva esses dois especificamente para ganho/perda (`--positive`/`--negative`), não pra identidade de série. São dadas como prontas pelo novo doc ("mantidas iguais ao design de referência"), não passam por nova validação de contraste/CVD.
5. **Commits sem atribuição de co-autoria** — sem rodapé "Co-Authored-By: Claude" em nenhum commit deste trabalho (decisão já documentada no antigo `ROADMAP.md`, reafirmada aqui já que o arquivo foi removido).

## Arquitetura — arquivos

### `src/app/globals.css` (modificação)
Novo bloco `[data-app-shell] { ... }` com a tabela de mapeamento acima, posicionado depois do `:root` e antes do `.dark` (mesma estrutura, só mais um bloco de override).

### `src/app/layout.tsx` (modificação)
Adicionar `Fustat` e `Inter_Tight` aos imports de `next/font/google`, gerar as variáveis (`--font-fustat`, `--font-inter-tight`) e incluí-las na `className` do `<html>` — sem remover Geist/Inter existentes.

### Novos primitivos — `src/components/ui/`
- **`dropdown-menu.tsx`** — wrap de `@base-ui/react/menu`. Radius 8px, `shadow-lg`, item destrutivo (ex: "Sair") em vermelho, separado visualmente dos demais itens (CRM.md 2.2/6.3).
- **`avatar.tsx`** — wrap de `@base-ui/react/avatar`, usado no cartão do usuário no rodapé da sidebar.
- **`tooltip.tsx`** — wrap de `@base-ui/react/tooltip`, usado no botão de info `(i)` dos cards de seção (CRM.md 4.2/4.3).
- **`section.tsx`** — componente genérico pro padrão 4.2: `<section>` com `<header>` (heading + botão de info com tooltip), fundo branco, borda 1px `#EDECDF` (via `border-border` já que o token foi remapeado), radius 12px, padding 16px.

### `src/components/ui/card.tsx` (modificação)
Adicionar variantes novas ao `cardVariants` (a variante `content` usada por login/registro **não muda**):
- `metric-wrapper`: bg `canvas-soft` (agora `#F6F6F0`), radius 16px, padding 16px — a moldura clara do padrão "card dentro de card" (4.1).
- `metric-child`: bg branco, radius 16px, padding 16px — os cards-filhos dentro da moldura.
- `resumo-linhas`: borda 1px, radius 16px, padding 20px — padrão 4.3 (lista de linhas label+valor+ícone info, separadas por divisória fina).

### `src/components/ui/button.tsx`
Sem mudança de código — só o CSS escopado (decisão de arquitetura, item 2).

### `src/components/ui/select.tsx` (modificação)
`SelectTrigger`: radius 8px. `SelectContent` (popup): trocar `shadow-md` por `shadow-lg` (CRM.md 6.3 dá o valor exato do box-shadow, que corresponde à utilidade `shadow-lg` do Tailwind).

### `src/components/ui/table.tsx` (modificação)
Container com radius 4px (CRM.md 7, "sutil comparado aos cards"). **Mantém o hover** (`hover:bg-muted/50` na `TableRow`, só recolorido pro novo `--muted`) — é comportamento de interação (ajuda a rastrear a linha numa lista de posições), não conflita com "sem zebra-striping". Zebra-striping estática (`even:`/`odd:bg-*`) já não existe no componente hoje — nada a remover aí, só confirmar que nada do tipo é adicionado.

### `src/features/app-shell/app-shell.tsx` (reescrita)
- `data-app-shell` no `<div>` raiz.
- Dois estados via `useState<boolean>` (expandida/colapsada), largura `264px`/`72px`, `transition-all duration-300`.
- Header da sidebar: logo/ícone da marca + botão toggle expandir/colapsar (Lucide `PanelLeftClose`/`PanelLeftOpen` ou similar).
- Overlay mobile mais escuro só nesse Dialog (decisão 2).

### `src/features/app-shell/sidebar-nav.tsx` (reescrita)
- Item ativo: `bg-primary text-ink` (decisão 3), radius 8px, altura 40px (ativo)/36px (inativo), padding `8px 12px`, gap ícone↔label 12px.
- Modo colapsado: só ícone, ativo vira "chip" 40×40px radius 8px.
- Rodapé fixo: `Avatar` + nome + botão "⋮" abrindo `DropdownMenu` (Perfil / Sair em vermelho) — substitui o botão "Sair" solto que existe hoje.
- Cada item de nav recebe um ícone Lucide (`LayoutDashboard`, `Wallet`, `LineChart`, `Calculator` ou equivalentes) — hoje os itens não têm ícone algum.

### `src/features/dashboard/resumo-cards.tsx` (reestruturação)
Padrão "card dentro de card" (4.1): `Card variant="metric-wrapper"` envolvendo os 4 `Card variant="metric-child"` já existentes hoje (Valor Investido, Valor Atual, Rentabilidade, Posições) lado a lado — CRM.md mostra 3 como exemplo ilustrativo, mesma lógica já aplicada à sidebar (4 itens de nav mesmo o CRM.md listando 3): não remove informação já exibida hoje só pra bater com a contagem do exemplo. Label em `text-body` (cinza-oliva), valor grande em `text-ink` peso forte.

### `src/app/(app)/dashboard/page.tsx` (modificação)
Envolve o card do gráfico de pizza (`AllocationPieChart`) num `<Section title="Alocação por classe de ativo">` em vez do `Card` genérico atual.

### `src/features/dashboard/aggregate-by-tipo.ts` (modificação)
`CORES_POR_TIPO` troca os 3 hex validados via dataviz por azul `#3B82F6` (Acao), roxo `#A855F7` (FII), teal `#14B8A6` (RendaFixa) — decisão 4.

### `src/features/metricas/metricas-stat-tiles.tsx` (reestruturação)
Migra pro padrão "resumo com linhas divididas" (4.3): usa `Card variant="resumo-linhas"`, uma linha por métrica (Volatilidade/Sharpe/Drawdown) com label + valor grande + ícone de info (tooltip), separadas por divisória fina — encaixa exatamente no padrão descrito, sem necessidade de adaptação.

### `src/app/(app)/metricas/page.tsx` (modificação)
Envolve `RetornoBarChart` num `<Section title="Carteira vs. CDI vs. Ibovespa">`.

### `src/features/metricas/retorno-bar-chart.tsx` (modificação)
Cores fixas por série (Carteira/CDI/Ibovespa) trocam pela mesma trinca azul/roxo/teal de `aggregate-by-tipo.ts` (decisão 4).

### `src/app/(app)/carteira/page.tsx` (modificação visual, sem mudança de lógica)
Tabela recebe o novo estilo (radius 4px, sem zebra) via mudança em `table.tsx` — a lógica de "cotação pendente" pra valores `null` já está correta hoje, só muda a cor do texto secundário pro novo `text-mute`/`text-body`.

### `src/app/(app)/simulador/page.tsx` (modificação)
Formulário e card de resultado passam a usar `<Section>` em vez do `Card` genérico atual, mantendo toda a lógica de validação/submit intacta.

## Fora de escopo (adiado)

- Home (`src/app/page.tsx`), login/registro (`src/app/(auth)/*`) — confirmado, zero mudança.
- Responsividade fina de tabelas/formulários além do que a sidebar/shell já cobre — item separado da Sprint 5.
- Dark mode real (o `.dark` do CSS continua inerte/não usado).
- Persistir o estado expandida/colapsada da sidebar entre reloads (ex: localStorage) — não pedido, fica como estado de componente simples.
- Re-validação via skill de dataviz das novas cores de gráfico — o novo `DESIGN-SYSTEM.md` já as dá como prontas ("mantidas iguais ao design de referência").

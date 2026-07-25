# Design System — InvestTrack CRM (Dashboard)

> Este documento complementa o `DESIGN-SYSTEM.md` principal (tipografia, cores de marca, ícones).
> Aqui o foco é **estrutural**: como os componentes do painel logado (dashboard/carteira) são montados —
> layout, hierarquia, espaçamentos, estados e comportamento. Baseado no dashboard real da AbacatePay,
> com a paleta rotacionada para a identidade amarela do InvestTrack (ver `DESIGN-SYSTEM.md`).
> Sempre que um valor já existe no design system base, ele é apenas citado (não redefinido).

## Stack

Next.js (App Router), Tailwind CSS, componentes com padrão de biblioteca tipo Radix/shadcn (popovers com portal, chevrons animados, `role="switch"`).

---

## 1. Estrutura geral da aplicação (App Shell)

```
<div class="h-screen flex flex-col overflow-hidden">
  ├─ Banner de ambiente (opcional, ex: "Ambiente de testes") — bg âmbar, texto escuro, botão outline
  └─ <div class="app flex-1 flex bg-[#F6F6F0] overflow-hidden rounded-t-[24px]">
       ├─ <aside>            → Sidebar (nav lateral)
       └─ <div main>         → Conteúdo (Topbar + página)
```

- Fundo geral da área logada: `#F6F6F0` — equivalente ao **"Fundo cinza claro"** do `DESIGN-SYSTEM.md`.
- O container principal tem `rounded-t-[24px]` (cantos superiores arredondados), separando visualmente a "aplicação" do banner/topo do navegador.
- Sem sombras nesse nível — reforça o estilo flat do design system base.

---

## 2. Sidebar (componente principal)

### 2.1 Estados: expandida ⇄ colapsada

| Estado | Largura | Padding interno | Conteúdo visível |
|---|---|---|---|
| Expandida | `264px` | `16px` | Ícone + label de cada item, nome do usuário |
| Colapsada | `72px` | `16px` | Apenas ícones centralizados (rail) |

- Transição: `transition-all duration-300` (largura e opacidade dos labels animam em 300ms — sem corte abrupto).
- No mobile (`md:` breakpoint), a sidebar vira **drawer**: `fixed`/`absolute`, com overlay (`fixed inset-0 z-40 bg-black/50`) atrás dela, fechando ao clicar fora. Em desktop, `relative`, sempre visível.

### 2.2 Hierarquia interna (de cima para baixo)

1. **Header da sidebar**: botão de fechar/menu (mobile) + logo/ícone da marca + botão toggle expandir/colapsar.
2. **Navegação principal** (`<nav><ul>`):
   - Itens de primeiro nível: **Dashboard**, **Carteira**, **Simulação** — links diretos.
   - Se houver necessidade de agrupamento futuro (ex: "Configurações" com sublinks), cada grupo funciona como **accordion independente** (abrir um não fecha os outros), com chevron que **rotaciona** conforme o estado.
   - Sublinks ficam indentados, sem ícone de "ativo" tão forte quanto o nível 1.
3. **Rodapé fixo da sidebar** (`role="contentinfo"`, sempre visível, não rola com a navegação):
   - Cartão do usuário: avatar + nome + botão "⋮" que abre um menu (Perfil / **Sair** em vermelho — ação destrutiva sempre diferenciada por cor).

### 2.3 Estilo dos itens de navegação

| Elemento | Valor |
|---|---|
| Item ativo (bg) | `#EAE668` — **limão claro** (marca InvestTrack) |
| Item ativo (texto) | `#1C1B10` — **quase-preto** |
| Item inativo (bg) | transparente |
| Border-radius do item | `8px` (não é pill) |
| Padding do item | `8px 12px` |
| Gap ícone↔label | `12px` |
| Altura do item | `40px` (ativo) / `36px` (inativo) |
| Ícone ativo (modo colapsado) | vira um "chip" quadrado `40×40px`, `border-radius: 8px`, mesmo limão claro de fundo |
| Fonte | Fustat, 16px, weight 400 |

> Ícones seguem o padrão Lucide (stroke 2, `currentColor`), tamanhos ≈16–20px.

---

## 3. Topbar (cabeçalho da página)

Estrutura: `breadcrumb` à esquerda + `título da página (H1)` + ícone de contexto, e ícone de notificações à direita (se houver).

- **Breadcrumb**: ícone + label (ex: "📊 Carteira / 📈 Posições"), separador `/`, fonte Fustat 16px/600, cor quase-preto.
- **H1 da página**: Fustat, **32px**, weight 600, cor `#1C1B10` — um degrau abaixo do h2 (48px) da landing; tamanho específico do contexto dashboard.
- Padding do container do topbar: `24px` (vertical e horizontal).

---

## 4. Cards e blocos de conteúdo

3 padrões distintos de card:

### 4.1 Card "métrica simples" (agrupado)

Usado nos números do topo do Dashboard (Valor total da carteira / Rentabilidade / Quantidade de ativos).

```
[Wrapper claro]  bg: #F6F6F0 · radius: 16px · padding: 16px
  ├─ [Card branco] bg: #fff · radius: 16px · padding: 16px   (métrica 1)
  ├─ [Card branco] bg: #fff · radius: 16px · padding: 16px   (métrica 2)
  └─ [Card branco] bg: #fff · radius: 16px · padding: 16px   (métrica 3)
```

Card-mãe claro (moldura) contendo cards-filhos brancos lado a lado — profundidade só com cor, sem sombra.
Label em cinza-oliva secundário (14–16px) + valor grande abaixo em quase-preto, weight forte.

### 4.2 Card "seção com gráfico" (`<section>` semântico)

Usado em blocos como "Evolução patrimonial", "Comparação com CDI/Ibovespa", "Alocação por classe de ativo".

| Propriedade | Valor |
|---|---|
| Tag | `<section>` com `<header>` interno |
| Fundo | branco puro |
| Borda | `1px solid #EDECDF` |
| Radius | `12px` |
| Padding | `16px` |
| Header interno | heading (h2, Fustat) + botão de "info" (ícone `(i)`, tooltip explicando a métrica) |

Card "padrão" para qualquer bloco com título + conteúdo (gráfico, tabela, lista).

### 4.3 Card "resumo com linhas divididas"

Ex: resumo de métricas de risco — "Volatilidade / Sharpe Ratio / Drawdown máximo".

| Propriedade | Valor |
|---|---|
| Borda | `1px solid #EDECDF` |
| Radius | `16px` |
| Padding | `20px` |
| Estrutura | lista de linhas "label + valor grande", ícone de info `(i)` à direita, separadas por linha divisória fina |

> Padrão geral: **nunca usa `box-shadow`** — a separação vem só de borda 1px + fundo branco sobre fundo claro da página.

---

## 5. Botões

⚠️ Diferente da landing (que usa pill, `border-radius: 9999px`): **no dashboard, todos os botões usam `border-radius: 8px`** (rounded-lg). Convenção confirmada: pill fica reservado à landing/marketing; dashboard usa 8px.

| Variante | Fundo | Borda | Texto | Peso/Fonte |
|---|---|---|---|---|
| Primário (CTA, ex: "Adicionar posição") | `#EAE668` limão claro | mesma cor | `#4A430E` oliva escuro | Fustat 600, 16px |
| Secundário / outline (ex: "Exportar", "Simular") | branco | `1px solid #EDECDF` | `#1C1B10` quase-preto | Fustat 600, 16px |
| Chip de filtro (ex: seletor de período "1M / 6M / 1A") — ativo | `#EAE668` | mesma cor | `#1C1B10` | 600, 14px |
| Chip de filtro — inativo | branco | `1px solid #EDECDF` | `#1C1B10` | 600, 14px |

Todos: `height: 40px`, `padding: 0 12px` (chip: `8px 12px`), `gap: 8px` entre ícone e texto, ícone Lucide à esquerda do label.

---

## 6. Inputs, Selects, Dropdowns e Popovers

### 6.1 Campo de busca

`label` como wrapper: bg `#F6F6F0`, borda `1px solid #EDECDF`, radius `8px`, altura `40px`, padding `0 12px`, ícone de lupa (Lucide) dentro.

### 6.2 Select / dropdown trigger (ex: "Todos os tipos de ativo")

Botão: fundo branco, borda `1px solid #EDECDF`, radius `8px`, padding `8px 12px`, chevron-down à direita que rotaciona quando aberto.

### 6.3 Painel de dropdown/popover (menu de perfil, seletor de ativo)

Único lugar com sombra (exceção proposital ao flat):
- `box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)` (equivalente a `shadow-lg`)
- Fundo branco, `border-radius: 8px`
- Itens de lista: padding `8px 24px 8px 12px`, hover com destaque, item selecionado com `✓`
- Ações destrutivas (ex: "Remover posição") em vermelho, separadas visualmente das demais

> O design flat vale para cards fixos na página; elementos flutuantes (popover/dropdown/menu) usam sombra para indicar camada acima do conteúdo.

---

## 7. Tabelas

Usado na listagem de posições da carteira.

- Header da tabela: células de texto simples (ex: "Ticker", "Tipo", "Quantidade", "Preço médio", "Preço atual", "Rentabilidade", "Ações"), fonte menor (14px), peso regular, cor secundária.
- `border-radius: 4px` no container da tabela (sutil comparado aos cards).
- Estado vazio: texto centralizado, cinza, simples (ex: "Nenhuma posição cadastrada ainda") — sem ilustração, minimalista.
- Sem zebra-striping nem bordas fortes entre linhas — estilo clean.
- Valores de rentabilidade: verde para ganho, vermelho para perda (cores de apoio semânticas do `DESIGN-SYSTEM.md`, não conflitam com a marca amarela).
- Quando `precoAtual`/rentabilidade vier `null` (cotação pendente): exibir texto secundário "cotação pendente" no lugar do valor, não deixar célula vazia nem quebrar layout.

---

## 8. Cores específicas de uso no dashboard (todas já existentes no `DESIGN-SYSTEM.md` — apenas mapeando o contexto)

| Cor (do design system base) | Onde aparece no dashboard |
|---|---|
| Limão claro `#EAE668` | Botão primário, item de nav ativo, chip de filtro ativo |
| Oliva escuro `#4A430E` | Texto do botão primário |
| Fundo cinza claro `#F6F6F0` | Fundo da sidebar/app shell, fundo do card-mãe de métricas, fundo do input de busca |
| Branco `#FFFFFF` | Cards individuais, popovers, tabela |
| Cinza claro (bordas) `#EDECDF` | Toda borda de card, input, select, botão secundário |
| Quase-preto `#1C1B10` | Headings de página, texto de nav ativo, chip ativo |
| Cinza-oliva (texto secundário) `#807A47` | Labels de métricas, textos de apoio |

Nenhuma cor nova é introduzida além da paleta já documentada no `DESIGN-SYSTEM.md` — o dashboard muda apenas a aplicação (radius de botão 8px e uso pontual de sombra em popovers).

---

## 9. Resumo para replicação (Claude Code)

Ao implementar o dashboard/carteira do InvestTrack, priorize estes padrões estruturais:

1. Sidebar com dois estados (largura `264px`/`72px`, transição 300ms) + rodapé fixo com cartão do usuário.
2. Sistema de "card dentro de card" para métricas agrupadas (moldura clara + filhos brancos) — usar no resumo do Dashboard.
3. `<section>` padrão (borda 1px + radius 12px + padding 16px) como componente genérico para qualquer bloco com header — usar nos gráficos (evolução patrimonial, comparação com benchmarks).
4. Botões com radius `8px` no dashboard (não usar pill aqui — pill é exclusivo da landing).
5. Popovers/dropdowns como único lugar com sombra (`shadow-lg`); tudo o resto flat.
6. Tabelas simples, sem zebra-striping, tratando valores `null` de cotação como "cotação pendente" em vez de célula vazia.
7. Tipografia herdada 100% do `DESIGN-SYSTEM.md` (Fustat para headings/nav/botões, Inter Tight para corpo).
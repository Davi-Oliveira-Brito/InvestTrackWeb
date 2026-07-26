# Design System — InvestTrack

> Baseado no design system da AbacatePay, mantendo tipografia, formas e ícones. A paleta de marca foi rotacionada de verde para amarelo (opção E: "Oliva quente & limão claro").

## Tipografia

| Uso | Fonte | Peso | Tamanho | Line-height |
|---|---|---|---|---|
| Headings (h1, h2, h3) / botões / links | Fustat | 600 (h1-h3) / 400 (link) / 600 (button) | h1: 44px · h2: 48px · h3: 20px · botão/link: 16px | h1: 46.2px · h2: 48px · h3: 20.4px |
| Corpo de texto (body, parágrafos) | Inter Tight | 400 (body) / 500 (p) | body: 16px · p: 18px | body: 24px |

Stack: **Next.js** (fontes carregadas via `next/font`).

## Paleta de cores

### Primárias / marca

| Cor | Valor | Uso |
|---|---|---|
| Oliva escuro | `#4A430E` | Texto de headings (h1) |
| Oliva médio | `#565017` | Texto de headings (h2, h3), texto de botão |
| Limão claro | `#EAE668` | Destaque / CTA |
| Limão forte | `#D6D02E` | Destaque / CTA (hover, estado ativo) |
| Limão suave | `#F8F7D4` | Fundo de badges/seções |

### Fundo e neutros

| Cor | Valor | Uso |
|---|---|---|
| Fundo geral | `#F8F5DF` | Background da página |
| Fundo alternativo | `#FAF9F0` | Seções alternativas |
| Fundo cinza claro | `FFFFF7` | Cards / blocos |
| Branco | `#FFFFFF` | Cards, superfícies |
| Cinza-oliva (texto secundário) | `#807A47` | Parágrafos, links |
| Quase-preto | `#1C1B10` | Texto de alto contraste |
| Cinza claro (bordas) | `#EDECDF` | Bordas / divisores |

### Cores de apoio (ícones, categorias, gráficos)

Mantidas iguais ao design de referência — não fazem parte da identidade de marca, servem para variedade em categorias/gráficos.

| Cor | Valor |
|---|---|
| Azul | `rgb(59, 130, 246)` |
| Roxo | `rgb(168, 85, 247)` |
| Teal | `rgb(20, 184, 166)` |
| Verde | `rgb(34, 197, 94)` |
| Rosa | `rgb(236, 72, 153)` |
| Vermelho | `rgb(239, 68, 68)` |

> Nota: verde e vermelho aqui são cores de **apoio** (ex: indicar ganho/perda em valores financeiros), não conflitam com a marca — são semânticas, não identitárias.

## Formas & componentes

| Elemento | Border-radius | Observações |
|---|---|---|
| Botões | `9999px` (pill) | Padding: `12px 16px` |
| Cards / blocos | `8px`, `12px`, `16px` | Cantos suaves |
| Sombras | Praticamente ausentes | Estilo flat, profundidade via cor/espaçamento |

## Ícones

- Biblioteca: **[Lucide Icons](https://lucide.dev)**.
- Padrão de classe: `lucide lucide-{nome-do-icone}` (ex: `lucide-chevron-down`, `lucide-arrow-right`, `lucide-menu`).
- Estilo: linha (stroke), sem preenchimento, `stroke-width: 2`, cantos arredondados.
- Tamanhos: `h-3.5 w-3.5`, `h-4 w-4`, `h-5 w-5`, `size-6` (aprox. 14px a 24px).
- Cor: geralmente herda `currentColor`, seguindo a cor do texto/contexto (ex: oliva escuro `#4A430E`).

## Resumo do estilo

Design clean e "fintech amigável": fundo bege-amarelado, headings em **Fustat** (geométrica, arredondada) combinados com corpo em **Inter Tight** (mais neutra), paleta ancorada no amarelo-limão (do oliva escuro ao limão claro), ícones em estilo linha via **Lucide**, cores de apoio vivas para variedade, e botões em formato pill reforçando a identidade amigável — mesma estrutura da AbacatePay, com identidade cromática própria.
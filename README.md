# InvestTrack Web

Front-end da plataforma de análise de portfólio de investimentos. Interface para cadastro de carteira, acompanhamento de rentabilidade, métricas de risco e comparação com benchmarks (CDI/Ibovespa), além de um simulador de investimentos e uma landing page pública de apresentação do projeto.

- **Front em produção:** [invest-trackk.vercel.app](https://invest-trackk.vercel.app/)
- **API:** [InvestTrackApi](https://github.com/Davi-Oliveira-Brito/InvestTrackApi) — [investtrackapi.onrender.com](https://investtrackapi.onrender.com)

## Funcionalidades

- **Autenticação:** cadastro e login de usuário.
- **Carteira:** cadastro, edição e remoção de posições (ações, FIIs, renda fixa), com autocomplete de ticker buscando na base de ativos.
- **Dashboard:** resumo de valor total investido, rentabilidade e quantidade de ativos, com gráficos de evolução patrimonial e alocação por classe de ativo.
- **Métricas de risco:** volatilidade, Sharpe ratio, drawdown máximo e comparação com benchmarks (CDI/Ibovespa).
- **Simulador:** simula quanto um investimento teria rendido se feito em uma data passada (limitado aos ativos com cotação histórica disponível: PETR4, MGLU3, VALE3, ITUB4).
- **Histórico:** log de criação, edição e remoção de posições da carteira.
- **Perfil e configurações:** edição de dados do usuário e alternância entre tema claro/escuro (aplicado só na área logada).
- **Landing page:** apresentação pública do projeto, com página `/sobre` explicando o que é real e o que é ilustrativo na demo.

## Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Linguagem:** TypeScript
- **Estilização:** [Tailwind CSS](https://tailwindcss.com)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com) (preset Nova - Lucide/Geist), sobre primitivas do Base UI
- **Ícones:** [Lucide](https://lucide.dev)
- **Deploy:** [Vercel](https://vercel.com)

## Estrutura de pastas

```
src/
├── app/            → Rotas e páginas (App Router)
├── components/     → Componentes reutilizáveis (inclui shadcn/ui em components/ui)
├── lib/            → Funções utilitárias
├── features/       → Código organizado por funcionalidade de negócio (auth, carteira, landing, etc.)
├── services/       → Chamadas à API (clientes HTTP)
└── types/          → Tipos e interfaces TypeScript compartilhados
```

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- npm 9+ (instalado junto com o Node.js)
- Git
- A [API do InvestTrack](https://github.com/Davi-Oliveira-Brito/InvestTrackApi) rodando (local ou apontando para a instância em produção) — necessária para login, carteira, métricas, simulador, histórico e perfil funcionarem

### Setup

```bash
git clone https://github.com/Davi-Oliveira-Brito/InvestTrackWeb.git
cd InvestTrackWeb

npm install
cp .env.example .env.local
```

### Variáveis de ambiente

| Variável | Descrição | Padrão se ausente |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da InvestTrackApi | `http://localhost:5158` |

Veja `.env.example` para o formato esperado.

### Rodando

```bash
npm run dev
```

O front sobe por padrão em `http://localhost:3000`.

Outros scripts disponíveis: `npm run build` (build de produção), `npm run start` (serve o build), `npm run lint` (ESLint).

## Design system

As decisões visuais (paleta, tipografia, ícones, formas, e a estrutura da sidebar/cards/tabelas da área logada) estão documentadas em [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) - vale a leitura para quem quiser entender o "porquê" por trás da UI antes de mexer nela.

## Observações

- As fotos de avatar usadas na seção de prova social da landing page (`public/rosto1.png` a `rosto4.png`), assim como o número de "500 investidores", são **ilustrativas** - não representam usuários reais da plataforma. Mais contexto sobre o que é real vs. ilustrativo no projeto está na página [`/sobre`](./src/app/sobre/page.tsx).
- O simulador de investimentos está limitado, por enquanto, aos ativos com cotação histórica disponível na API (PETR4, MGLU3, VALE3, ITUB4).

## Deploy

Deploy contínuo na Vercel, com build automático a cada push na branch `main`.

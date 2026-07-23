# InvestTrack Web

Front-end da plataforma de análise de portfólio de investimentos. Interface para cadastro de carteira, acompanhamento de rentabilidade, métricas de risco e comparação com benchmarks (CDI/Ibovespa).

 **Front em produção:** *(em breve, deploy na Vercel)*
 **API:** [InvestTrackApi](https://github.com/Davi-Oliveira-Brito/InvestTrackApi) — [investtrackapi.onrender.com](https://investtrackapi.onrender.com)

## Stack

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** shadcn/ui (preset Nova — Lucide/Geist)
- **Deploy:** Vercel

## Estrutura de pastas

```
src/
├── app/            → Rotas e páginas (App Router)
├── components/     → Componentes reutilizáveis (inclui shadcn/ui em components/ui)
├── lib/            → Funções utilitárias
├── features/       → Código organizado por funcionalidade de negócio (auth, portfolio, etc.)
├── services/       → Chamadas à API (clientes HTTP)
├── hooks/          → Custom hooks React
└── types/          → Tipos e interfaces TypeScript compartilhados
```

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- A [API do InvestTrack](https://github.com/Davi-Oliveira-Brito/InvestTrackApi) rodando (local ou em produção)

### Passos

```bash
git clone https://github.com/Davi-Oliveira-Brito/InvestTrackWeb.git
cd InvestTrackWeb

npm install
npm run dev
```

O front sobe por padrão em `http://localhost:3000`.

## Roadmap

O desenvolvimento está sendo feito em sprints, em conjunto com a API. Acompanhe o progresso no [ROADMAP.md do repositório da API](https://github.com/Davi-Oliveira-Brito/InvestTrackApi/blob/main/ROADMAP.md).

## Deploy

- Deploy planejado na Vercel, com integração automática a cada push na branch `main`.

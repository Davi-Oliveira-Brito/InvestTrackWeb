import Link from "next/link"

import { Footer } from "@/features/landing/footer"
import { Navbar } from "@/features/landing/navbar"

export default function SobrePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#16181A]">
      <Navbar />

      <main className="flex flex-1 flex-col bg-[#16181A] px-6 py-16">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-3xl font-black tracking-tight text-[#ECEDEE] sm:text-4xl">
              Sobre o InvestTrack
            </h1>
            <p className="text-[#A0A3A7]">
              O InvestTrack é um projeto pessoal de portfólio, desenvolvido para demonstrar
              habilidades de desenvolvimento full-stack, não é um produto comercial.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-bold text-[#ECEDEE]">O que é real</h2>
            <p className="text-[#A0A3A7]">
              As funcionalidades do painel: Cadastro e login, carteira de investimentos, cálculo
              de métricas e rentabilidade, comparação com CDI e Ibovespa, histórico de operações e
              o simulador de investimentos - são funcionais de verdade, com backend e persistência
              de dados próprios.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-bold text-[#ECEDEE]">O que é ilustrativo</h2>
            <p className="text-[#A0A3A7]">
              Alguns elementos da página inicial existem só para compor o visual de landing page
              e não representam dados reais: as fotos e o número de &ldquo;500 investidores&rdquo; na seção de
              prova social são fictícios. O simulador também está limitado, por enquanto, a
              cotações históricas de PETR4, MGLU3, VALE3 e ITUB4.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-bold text-[#ECEDEE]">Quem fez</h2>
            <p className="text-[#A0A3A7]">
              Feito por Davi Oliveira Brito. Você pode ver mais projetos e entrar em contato pelo{" "}
              <a
                href="https://www.linkedin.com/in/davi-oliveira-brito-b7267b252/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#ECEDEE]"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>

          <Link href="/" className="text-sm text-[#A0A3A7] underline hover:text-[#ECEDEE]">
            Voltar para a página inicial
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

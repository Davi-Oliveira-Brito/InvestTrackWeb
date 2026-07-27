"use client"

import { motion, type Variants } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const AVATARS = ["rosto1.png", "rosto2.png", "rosto3.png", "rosto4.png"]

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function Hero() {
  return (
    <main className="relative z-0 flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/hero2.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#16181A] to-transparent" />
        <div className="absolute inset-0 bg-[#16181A]/55" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
      >
        <motion.h1
          variants={item}
          className="font-heading text-4xl font-black tracking-tight text-[#ECEDEE] sm:text-5xl md:text-6xl"
        >
          O controle da sua <br /> carteira de investimentos.
        </motion.h1>
        <motion.p variants={item} className="max-w-xxl text-lg text-white">
          Acompanhe rentabilidade, risco e como você se compara ao CDI e ao
          Ibovespa. <br />Tudo em um painel só, sem planilha e sem retrabalho.
        </motion.p>

        <motion.div variants={item} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/registro">Criar conta</Link>}
            nativeButton={false}
            size="xl"
            className="rounded-full bg-[#EAE668] text-[#16181A] transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-[0_0_28px_rgba(234,230,104,0.55)]"
          />
          <Button
            render={<Link href="/sobre">Saiba mais</Link>}
            nativeButton={false}
            variant="outline"
            size="xl"
            className="rounded-full border-white/70 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          />
        </motion.div>

        <motion.div
          id="prova-social"
          variants={item}
          className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:gap-3"
        >
          <div className="flex -space-x-3">
            {AVATARS.map((arquivo) => (
              <Image
                key={arquivo}
                src={`/${arquivo}`}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border-2 border-[#16181A] bg-[#202225] object-cover"
              />
            ))}
          </div>
          <p className="text-center text-sm text-white/80 sm:text-left">
            Mais de 500 investidores já acompanham a carteira aqui.
          </p>
        </motion.div>
      </motion.div>
    </main>
  )
}

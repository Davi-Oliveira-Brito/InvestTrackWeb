import Link from "next/link"

import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#2C2F33]/40 bg-[#16181A]/25 px-6 py-5 backdrop-blur-md sm:px-10">
      <Link href="/" className="font-heading text-lg font-black tracking-tight text-[#ECEDEE]">
        InvestTrack
      </Link>

      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/login">Entrar</Link>}
          nativeButton={false}
          variant="outline"
          className="rounded-full border-[#ECEDEE]/30 bg-[#ECEDEE]/5 text-[#ECEDEE] hover:bg-[#ECEDEE]/10"
        />
        <Button
          render={<Link href="/registro">Criar conta</Link>}
          nativeButton={false}
          className="rounded-full bg-[#D6D02E] text-[#16181A] hover:bg-[#C4BE2A]"
        />
      </div>
    </header>
  )
}

import { Footer } from "@/features/landing/footer"
import { Hero } from "@/features/landing/hero"
import { Navbar } from "@/features/landing/navbar"

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#16181A]">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  )
}

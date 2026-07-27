import Link from "next/link"

const LINKEDIN_URL = "https://www.linkedin.com/in/davi-oliveira-brito-b7267b252/"

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-[#2C2F33] bg-[#16181A] px-6 py-5 text-sm text-[#A0A3A7] sm:flex-row sm:justify-between sm:gap-4 sm:px-10 sm:py-4">
      <p className="order-1 text-center text-xs text-balance text-[#A0A3A7] sm:order-2 sm:max-w-sm sm:flex-1">
        alguns dados desta página são ilustrativos.{" "}
        <Link href="/sobre" className="font-medium text-[#ECEDEE] underline underline-offset-2">
          Saiba mais
        </Link>
      </p>

      <div className="order-2 flex w-full shrink-0 items-center justify-between sm:order-1 sm:w-auto sm:justify-start sm:gap-4">
        <span>© {new Date().getFullYear()} InvestTrack</span>

        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 text-[#A0A3A7] hover:text-[#ECEDEE]"
        >
          <LinkedinIcon className="size-3.5" />
          LinkedIn
        </a>
      </div>
    </footer>
  )
}

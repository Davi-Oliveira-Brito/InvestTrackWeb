import type { Metadata } from "next";
import { Fustat, Inter_Tight } from "next/font/google";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

// Runs before hydration so the stored theme is applied without a flash of
// the wrong palette — mirrors what next-themes does, without the dependency.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("investtrack:tema");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

const fustat = Fustat({
  variable: "--font-fustat",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const SITE_URL = "https://invest-trackk.vercel.app";
const DESCRIPTION =
  "Acompanhe a rentabilidade, o risco e a comparação com benchmarks da sua carteira de investimentos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "InvestTrack",
  description: DESCRIPTION,
  openGraph: {
    title: "InvestTrack",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "InvestTrack",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestTrack",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fustat.variable} ${interTight.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <AuthProvider>
            <Toaster>{children}</Toaster>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

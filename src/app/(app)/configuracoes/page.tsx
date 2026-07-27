"use client"

import { Label } from "@/components/ui/label"
import { Section } from "@/components/ui/section"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/features/theme/theme-provider"

export default function ConfiguracoesPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="flex flex-1 flex-col gap-6 bg-canvas-soft px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Configurações
        </h1>

        <Section title="Aparência">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="tema-switch">Tema escuro</Label>
              <p className="text-sm text-body">
                Alterna entre os temas claro e escuro da interface.
              </p>
            </div>
            <Switch
              id="tema-switch"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </Section>
      </div>
    </main>
  )
}

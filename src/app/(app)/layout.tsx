import { ProtectedRoute } from "@/features/auth/protected-route"
import { AppShell } from "@/features/app-shell/app-shell"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

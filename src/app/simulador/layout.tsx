import { ProtectedRoute } from "@/features/auth/protected-route"

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

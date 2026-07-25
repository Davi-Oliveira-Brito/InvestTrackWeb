import { ProtectedRoute } from "@/features/auth/protected-route"

export default function CarteiraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

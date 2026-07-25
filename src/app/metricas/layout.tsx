import { ProtectedRoute } from "@/features/auth/protected-route"

export default function MetricasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

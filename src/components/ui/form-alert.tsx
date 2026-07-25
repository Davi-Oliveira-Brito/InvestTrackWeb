function FormAlert({ children }: { children?: React.ReactNode }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className="rounded-md border border-negative/30 bg-negative/5 px-4 py-3 text-sm text-negative"
    >
      {children}
    </div>
  )
}

export { FormAlert }

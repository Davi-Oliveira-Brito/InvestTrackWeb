function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null

  return (
    <p role="alert" className="text-sm text-negative">
      {children}
    </p>
  )
}

export { FieldError }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateNome(nome: string): string | undefined {
  if (nome.trim().length === 0) return "Informe seu nome."
  return undefined
}

export function validateEmail(email: string): string | undefined {
  if (email.trim().length === 0) return "Informe seu e-mail."
  if (!EMAIL_PATTERN.test(email)) return "Informe um e-mail válido."
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres."
  if (!/[A-Za-z]/.test(password)) return "A senha deve conter ao menos 1 letra."
  if (!/[0-9]/.test(password)) return "A senha deve conter ao menos 1 número."
  return undefined
}
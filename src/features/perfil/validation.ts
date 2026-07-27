export function validateNome(nome: string): string | undefined {
  if (nome.trim().length === 0) return "Informe seu nome."
  if (nome.length > 200) return "O nome deve ter no máximo 200 caracteres."
  return undefined
}

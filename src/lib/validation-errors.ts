import type { ApiError, ValidationErrors } from "@/types/api"

/**
 * The API's exact casing for validation-error keys isn't confirmed yet — this
 * checks both camelCase and PascalCase so the UI degrades gracefully either way.
 */
export function pickError(
  errors: ValidationErrors,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const messages = errors[key]
    if (messages && messages.length > 0) return messages[0]
  }
  return undefined
}

export function getApiErrorMessage(error: ApiError): string {
  switch (error.kind) {
    case "rate-limited":
      return "Muitas tentativas. Aguarde um pouco e tente novamente."
    case "network":
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
    case "business":
    case "unexpected":
      return error.message
    case "validation":
      return "Verifique os campos destacados."
  }
}

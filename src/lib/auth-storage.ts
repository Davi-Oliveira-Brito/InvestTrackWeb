const TOKEN_KEY = "investtrack:token"
const EXPIRES_KEY = "investtrack:expiraEm"
const EMAIL_KEY = "investtrack:email"
const NOME_KEY = "investtrack:nome"

export interface Session {
  token: string
  expiraEm: string
  email: string
  nome?: string
}

export function saveSession(session: Session): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(EXPIRES_KEY, session.expiraEm)
  localStorage.setItem(EMAIL_KEY, session.email)
  if (session.nome) {
    localStorage.setItem(NOME_KEY, session.nome)
  } else {
    localStorage.removeItem(NOME_KEY)
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(NOME_KEY)
}

export function getSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiraEm = localStorage.getItem(EXPIRES_KEY)
  const email = localStorage.getItem(EMAIL_KEY)

  if (!token || !expiraEm || !email) return null

  if (new Date(expiraEm).getTime() <= Date.now()) {
    clearSession()
    return null
  }

  return { token, expiraEm, email, nome: localStorage.getItem(NOME_KEY) ?? undefined }
}

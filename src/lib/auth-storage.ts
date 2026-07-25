const TOKEN_KEY = "investtrack:token"
const EXPIRES_KEY = "investtrack:expiraEm"

export interface Session {
  token: string
  expiraEm: string
}

export function saveSession(session: Session): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(EXPIRES_KEY, session.expiraEm)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export function getSession(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiraEm = localStorage.getItem(EXPIRES_KEY)

  if (!token || !expiraEm) return null

  if (new Date(expiraEm).getTime() <= Date.now()) {
    clearSession()
    return null
  }

  return { token, expiraEm }
}

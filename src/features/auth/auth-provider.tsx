"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

import { clearSession, getSession, saveSession, type Session } from "@/lib/auth-storage"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  token: string | null
  email: string | null
  nome: string | null
  login: (session: Session) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [nome, setNome] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setToken(session.token)
      setEmail(session.email)
      setNome(session.nome ?? null)
      setStatus("authenticated")
    } else {
      setStatus("unauthenticated")
    }
  }, [])

  const login = useCallback((session: Session) => {
    saveSession(session)
    setToken(session.token)
    setEmail(session.email)
    setNome(session.nome ?? null)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setEmail(null)
    setNome(null)
    setStatus("unauthenticated")
  }, [])

  return (
    <AuthContext.Provider value={{ status, token, email, nome, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

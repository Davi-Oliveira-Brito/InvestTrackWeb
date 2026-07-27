"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/features/auth/auth-provider"
import { validateEmail, validatePassword } from "@/features/auth/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { login } from "@/services/auth-service"

interface FieldErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login: setSession } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setFieldErrors(errors)
    if (errors.email || errors.password) return

    setIsSubmitting(true)
    const result = await login({ email, password })
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          email: pickError(result.error.errors, "email", "Email"),
          password: pickError(result.error.errors, "password", "Password"),
        })
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    setSession({ ...result.data, email })
    router.push("/dashboard")
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-body">Acesse sua carteira de investimentos.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <FieldError>{fieldErrors.email}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FieldError>{fieldErrors.password}</FieldError>
        </div>

        <Button type="submit" size="xl" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Não tem conta?{" "}
        <Link href="/registro" className="font-semibold text-ink underline underline-offset-2">
          Criar conta
        </Link>
      </p>
    </Card>
  )
}

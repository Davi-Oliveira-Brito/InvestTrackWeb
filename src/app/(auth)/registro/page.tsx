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
import { validateEmail, validateNome, validatePassword } from "@/features/auth/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { register } from "@/services/auth-service"

interface FieldErrors {
  nome?: string
  email?: string
  password?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { login: setSession } = useAuth()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors: FieldErrors = {
      nome: validateNome(nome),
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setFieldErrors(errors)
    if (errors.nome || errors.email || errors.password) return

    setIsSubmitting(true)
    const result = await register({ nome, email, password })
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setFieldErrors({
          nome: pickError(result.error.errors, "nome", "Nome"),
          email: pickError(result.error.errors, "email", "Email"),
          password: pickError(result.error.errors, "password", "Password"),
        })
        return
      }
      setFormError(getApiErrorMessage(result.error))
      return
    }

    setSession({ ...result.data, email, nome })
    router.push("/dashboard")
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-body">Comece a acompanhar sua carteira em minutos.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            autoComplete="name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            aria-invalid={Boolean(fieldErrors.nome)}
          />
          <FieldError>{fieldErrors.nome}</FieldError>
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <FieldError>{fieldErrors.password}</FieldError>
          {!fieldErrors.password && (
            <p className="text-xs text-mute">Mínimo 8 caracteres, com ao menos 1 letra e 1 número.</p>
          )}
        </div>

        <Button type="submit" size="xl" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </Card>
  )
}

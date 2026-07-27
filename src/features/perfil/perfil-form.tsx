"use client"

import { Camera, Trash2 } from "lucide-react"
import { useRef, useState, type FormEvent } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { FormAlert } from "@/components/ui/form-alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { validateNome } from "@/features/perfil/validation"
import { getApiErrorMessage, pickError } from "@/lib/validation-errors"
import { deleteFoto, updatePerfil, uploadFoto } from "@/services/perfil-service"
import type { PerfilResponse } from "@/types/perfil"

interface PerfilFormProps {
  token: string
  perfil: PerfilResponse
  onUpdated: (perfil: PerfilResponse) => void
}

function initials(value: string): string {
  return value.slice(0, 2).toUpperCase()
}

export function PerfilForm({ token, perfil, onUpdated }: PerfilFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploadingFoto, setIsUploadingFoto] = useState(false)
  const [fotoError, setFotoError] = useState<string | null>(null)

  const [nome, setNome] = useState(perfil.nome)
  const [nomeError, setNomeError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayFotoUrl = previewUrl ?? perfil.fotoUrl

  async function handleFotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setFotoError(null)
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setIsUploadingFoto(true)

    const result = await uploadFoto(file, token)
    setIsUploadingFoto(false)
    URL.revokeObjectURL(localPreview)
    setPreviewUrl(null)

    if (!result.ok) {
      const message = getApiErrorMessage(result.error)
      setFotoError(message)
      toast.add({ title: "Erro ao enviar foto", description: message, type: "error" })
      return
    }
    toast.add({ title: "Foto atualizada", type: "success" })
    onUpdated({ ...perfil, fotoUrl: result.data.fotoUrl })
  }

  async function handleRemoveFoto() {
    setFotoError(null)
    setIsUploadingFoto(true)
    const result = await deleteFoto(token)
    setIsUploadingFoto(false)

    if (!result.ok) {
      const message = getApiErrorMessage(result.error)
      setFotoError(message)
      toast.add({ title: "Erro ao remover foto", description: message, type: "error" })
      return
    }
    toast.add({ title: "Foto removida", type: "success" })
    onUpdated({ ...perfil, fotoUrl: null })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const error = validateNome(nome)
    setNomeError(error)
    if (error) return

    setIsSubmitting(true)
    const result = await updatePerfil({ nome }, token)
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error.kind === "validation") {
        setNomeError(pickError(result.error.errors, "nome", "Nome"))
        return
      }
      const message = getApiErrorMessage(result.error)
      setFormError(message)
      toast.add({ title: "Erro ao salvar perfil", description: message, type: "error" })
      return
    }

    toast.add({ title: "Perfil atualizado", type: "success" })
    onUpdated(result.data)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className="size-20">
            {displayFotoUrl && <AvatarImage src={displayFotoUrl} alt={perfil.nome} />}
            <AvatarFallback className="text-lg">{initials(perfil.nome || "?")}</AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="absolute right-0 bottom-0 rounded-full bg-canvas"
            aria-label="Alterar foto"
            disabled={isUploadingFoto}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFotoSelected}
          />
        </div>

        {perfil.fotoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-negative hover:bg-destructive/10 hover:text-negative"
            disabled={isUploadingFoto}
            onClick={handleRemoveFoto}
          >
            <Trash2 className="size-4" />
            Remover foto
          </Button>
        )}

        <FieldError>{fotoError}</FieldError>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perfil-nome">Nome</Label>
          <Input
            id="perfil-nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            aria-invalid={Boolean(nomeError)}
          />
          <FieldError>{nomeError}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perfil-email">E-mail</Label>
          <Input id="perfil-email" value={perfil.email} disabled readOnly />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  )
}

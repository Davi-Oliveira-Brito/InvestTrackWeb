"use client"

import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FormAlert } from "@/components/ui/form-alert"
import { getApiErrorMessage } from "@/lib/validation-errors"
import { deletePosicao } from "@/services/carteira-service"
import type { PosicaoResponse } from "@/types/carteira"

interface DeletePosicaoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  posicao: PosicaoResponse | null
  token: string
  onDeleted: () => void
}

export function DeletePosicaoDialog({
  open,
  onOpenChange,
  posicao,
  token,
  onDeleted,
}: DeletePosicaoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!posicao) return

    setIsDeleting(true)
    setError(null)
    const result = await deletePosicao(posicao.id, token)
    setIsDeleting(false)

    if (!result.ok) {
      setError(getApiErrorMessage(result.error))
      return
    }

    onDeleted()
    onOpenChange(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) onOpenChange(nextOpen)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover posição</AlertDialogTitle>
          <AlertDialogDescription>
            Remover {posicao?.ticker} da carteira? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FormAlert>{error}</FormAlert>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

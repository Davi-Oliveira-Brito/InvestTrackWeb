export interface PerfilResponse {
  nome: string
  email: string
  fotoUrl: string | null
}

export interface EditarPerfilPayload {
  nome: string
}

export interface FotoPerfilResponse {
  fotoUrl: string
}

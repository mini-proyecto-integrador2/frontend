import { createContext, useContext } from 'react'
import type { AvatarId } from '../components/SelectorAvatar'

export type Usuario = {
  nombres: string
  usuario: string
  avatar: AvatarId
}

type Valor = {
  usuario: Usuario | null
  iniciarSesion: (usuario: Usuario) => void
  cerrarSesion: () => void
}

export const SesionContexto = createContext<Valor | null>(null)

export function useSesion() {
  const valor = useContext(SesionContexto)
  if (!valor) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return valor
}
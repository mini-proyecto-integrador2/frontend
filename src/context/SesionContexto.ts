import { createContext, useContext } from 'react'
import type { AvatarId } from '../components/SelectorAvatar'

export type Usuario = {
  nombres: string
  usuario: string // '' = entró con Google pero aún no eligió nombre de usuario
  avatar: AvatarId
  correo?: string
}

type Valor = {
  usuario: Usuario | null
  cargando: boolean
  errorSesion: string
  iniciarSesion: (usuario: Usuario) => void // temporal: se quita en la 4.6
  cerrarSesion: () => void
}

export const SesionContexto = createContext<Valor | null>(null)

export function useSesion() {
  const valor = useContext(SesionContexto)
  if (!valor) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return valor
}
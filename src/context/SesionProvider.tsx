import { useState } from 'react'
import type { ReactNode } from 'react'
import { SesionContexto } from './SesionContexto'
import type { Usuario } from './SesionContexto'

const CLAVE = 'sesion-simulada'

function leerSesion(): Usuario | null {
  try {
    const guardado = sessionStorage.getItem(CLAVE)
    return guardado ? (JSON.parse(guardado) as Usuario) : null
  } catch {
    return null
  }
}

export default function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion)

  function iniciarSesion(nuevo: Usuario) {
    setUsuario(nuevo)
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(nuevo))
    } catch {
      /* si el navegador no deja guardar, la sesión dura mientras no se recargue */
    }
  }

  function cerrarSesion() {
    setUsuario(null)
    try {
      sessionStorage.removeItem(CLAVE)
    } catch {
      /* nada que hacer */
    }
  }

  return (
    <SesionContexto.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContexto.Provider>
  )
}
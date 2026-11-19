import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { ErrorApi, obtenerMiPerfil } from '../services/api'
import type { Perfil } from '../services/api'
import { SesionContexto } from './SesionContexto'
import type { Usuario } from './SesionContexto'
import type { AvatarId } from '../components/SelectorAvatar'



export default function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorSesion, setErrorSesion] = useState('')

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUsuario(null)
        setCargando(false)
        return
      }

      setCargando(true)
      try {
        const perfil = await obtenerMiPerfil()
        setUsuario({
          nombres: perfil.nombres,
          usuario: perfil.username,
          avatar: perfil.avatar as AvatarId,
          correo: perfil.correo,
        })
        setErrorSesion('')
      } catch (e) {
        if (e instanceof ErrorApi && e.codigo === 'PROFILE_NOT_FOUND') {
          // Entró con Google y aún no tiene perfil: debe elegir nombre de usuario.
          setUsuario({
            nombres: firebaseUser.displayName ?? '',
            usuario: '',
            avatar: 'A',
            correo: firebaseUser.email ?? '',
          })
          setErrorSesion('')
        } else {
          setErrorSesion('No pudimos iniciar tu sesión. Intenta de nuevo en unos segundos.')
          setUsuario(null)
          await signOut(auth)
        }
      } finally {
        setCargando(false)
      }
    })
    return cancelar
  }, [])

  function establecerPerfil(perfil: Perfil) {
    setUsuario({
      nombres: perfil.nombres,
      usuario: perfil.username,
      avatar: perfil.avatar as AvatarId,
      correo: perfil.correo,
    })
  }
  function cerrarSesion() {
    setUsuario(null)
    void signOut(auth)
  }

  return (
    <SesionContexto.Provider
      value={{ usuario, cargando, errorSesion, establecerPerfil, cerrarSesion }}
    >
      {children}
    </SesionContexto.Provider>
  )
}
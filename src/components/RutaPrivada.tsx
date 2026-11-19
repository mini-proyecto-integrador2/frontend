import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Carga from './Carga'
import { useSesion } from '../context/SesionContexto'

export default function RutaPrivada() {
  const { usuario, cargando } = useSesion()
  const { pathname } = useLocation()

  // Firebase aún está restaurando la sesión: no mandar a /ingresar todavía.
  if (cargando) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <Carga texto="Verificando tu sesión..." className="justify-center" />
      </div>
    )
  }

  if (!usuario) return <Navigate to="/ingresar" replace />

  if (usuario.usuario === '' && pathname !== '/completar-perfil') {
    return <Navigate to="/completar-perfil" replace />
  }

  return <Outlet />
}
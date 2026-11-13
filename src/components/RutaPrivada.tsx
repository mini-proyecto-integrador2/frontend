import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../context/SesionContexto'

export default function RutaPrivada() {
  const { usuario } = useSesion()
  const { pathname } = useLocation()

  if (!usuario) return <Navigate to="/ingresar" replace />

  // Entró con Google pero aún no eligió nombre de usuario: no puede saltar ese paso.
  if (usuario.usuario === '' && pathname !== '/completar-perfil') {
    return <Navigate to="/completar-perfil" replace />
  }

  return <Outlet />
}
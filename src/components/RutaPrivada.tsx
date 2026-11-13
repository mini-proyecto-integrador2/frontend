import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from '../context/SesionContexto'

export default function RutaPrivada() {
  const { usuario } = useSesion()
  if (!usuario) return <Navigate to="/ingresar" replace />
  return <Outlet />
}
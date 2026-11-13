import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Boton, { BotonEnlace } from './Boton'
import { useSesion } from '../context/SesionContexto'

// Encabezado público (mapa del sitio): logo + Ingresar/Registrarse o Cerrar sesión.
// En celular las acciones se esconden detrás del botón de menú (44 px de área táctil).
export default function Encabezado() {
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()
  const { usuario, cerrarSesion } = useSesion()
  const navigate = useNavigate()
  const [rutaAnterior, setRutaAnterior] = useState(pathname)
  if (pathname !== rutaAnterior) {
    setRutaAnterior(pathname)
    setAbierto(false)
  }

  function salir() {
    cerrarSesion()
    navigate('/ingresar', { state: { cerradaSesion: true } })
  }

  return (
    <header className="border-b border-superficie bg-fondo">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-16 md:py-4">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-3 md:flex">
          {usuario ? (
            <>
              <span className="text-sm text-texto-secundario">Hola, {usuario.nombres}</span>
              <Boton tipo="secundario" onClick={salir}>
                Cerrar sesión
              </Boton>
            </>
          ) : (
            <>
              <BotonEnlace to="/ingresar" tipo="secundario">Ingresar</BotonEnlace>
              <BotonEnlace to="/registro">Registrarse</BotonEnlace>
            </>
          )}
        </nav>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-lg border border-borde md:hidden focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto((v) => !v)}
        >
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {abierto ? (
              <>
                <line x1="6" x2="18" y1="6" y2="18" />
                <line x1="18" x2="6" y1="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {abierto && (
        <nav id="menu-movil" aria-label="Principal" className="flex flex-col gap-3 border-t border-superficie px-4 py-4 md:hidden">
          {usuario ? (
            <>
              <span className="text-sm text-texto-secundario">Hola, {usuario.nombres}</span>
              <Boton tipo="secundario" onClick={salir}>
                Cerrar sesión
              </Boton>
            </>
          ) : (
            <>
              <BotonEnlace to="/ingresar" tipo="secundario">Ingresar</BotonEnlace>
              <BotonEnlace to="/registro">Registrarse</BotonEnlace>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
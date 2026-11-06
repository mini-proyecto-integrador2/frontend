import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { Outlet, matchPath, useLocation } from 'react-router-dom'
import Encabezado from '../components/Encabezado'
import Pie from '../components/Pie'

// Título de cada pantalla: WCAG 2.4.2. Cada ruta del mapa del sitio tiene el suyo.
const TITULOS: { ruta: string; titulo: string }[] = [
  { ruta: '/', titulo: 'Inicio' },
  { ruta: '/ingresar', titulo: 'Ingresar' },
  { ruta: '/registro', titulo: 'Registrarse' },
  { ruta: '/ayuda', titulo: 'Ayuda' },
  { ruta: '/completar-perfil', titulo: 'Completar perfil' },
  { ruta: '/panel', titulo: 'Panel' },
  { ruta: '/perfil', titulo: 'Perfil' },
  { ruta: '/sala/:id', titulo: 'Sala' },
  { ruta: '/base-tecnica', titulo: 'Base técnica' },
]

function tituloDe(pathname: string) {
  const coincide = TITULOS.find((t) => matchPath({ path: t.ruta, end: true }, pathname))
  return coincide ? coincide.titulo : 'Página no encontrada'
}

export default function LayoutBase() {
  const { pathname } = useLocation()
  const contenido = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = `${tituloDe(pathname)} | Salón de Estudio`
  }, [pathname])

  // Enlace «Saltar al contenido»: mueve el foco al <main> (WCAG 2.4.1).
  function saltar(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    contenido.current?.focus()
    contenido.current?.scrollIntoView()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        onClick={saltar}
        className="absolute left-2 top-2 z-50 -translate-y-20 rounded-lg bg-primario-oscuro px-4 py-3 font-semibold text-white focus:translate-y-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario focus-visible:ring-offset-2"
      >
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="contenido" ref={contenido} tabIndex={-1} className="flex-1 focus:outline-none">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <Pie />
    </div>
  )
}

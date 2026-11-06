import { Link } from 'react-router-dom'

const enlace =
  'font-semibold text-primario underline rounded hover:text-primario-oscuro focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2'

export default function Pie() {
  return (
    <footer className="bg-superficie">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 md:px-16">
        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/ayuda" className={enlace}>Ayuda</Link>
          <Link to="/ayuda#accesibilidad" className={enlace}>Accesibilidad</Link>
          <Link to="/base-tecnica" className={enlace}>Base técnica</Link>
        </nav>
        <p className="text-sm text-texto-secundario">© 2026 Equipo En Punto · Univalle · Proyecto Integrador</p>
      </div>
    </footer>
  )
}

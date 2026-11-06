import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2">
      <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-primario font-semibold text-white">
        SE
      </span>
      <span className="font-titulo text-xl font-medium">Salón de Estudio</span>
    </Link>
  )
}

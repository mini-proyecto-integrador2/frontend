import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

type Tipo = 'primario' | 'secundario' | 'peligro'

// Estilos del componente "Botón" de la guía visual: primario, secundario y peligro,
// con anillo de foco visible (2 px blanco + 3 px azul oscuro) y estado deshabilitado.
const base =
  'inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:border disabled:border-borde disabled:bg-superficie disabled:text-texto-secundario'

const tipos: Record<Tipo, string> = {
  primario: 'bg-primario text-white hover:bg-primario-oscuro',
  secundario: 'border-2 border-primario bg-fondo text-primario hover:bg-superficie',
  peligro: 'bg-error text-white hover:brightness-90',
}

export function clasesBoton(tipo: Tipo = 'primario', extra = '') {
  return `${base} ${tipos[tipo]} ${extra}`
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { tipo?: Tipo }

export default function Boton({ tipo = 'primario', className = '', ...props }: Props) {
  return <button className={clasesBoton(tipo, className)} {...props} />
}

export function BotonEnlace({ to, tipo = 'primario', className = '', children }: { to: string; tipo?: Tipo; className?: string; children: React.ReactNode }) {
  return (
    <Link to={to} className={clasesBoton(tipo, className)}>
      {children}
    </Link>
  )
}

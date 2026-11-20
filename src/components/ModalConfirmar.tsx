import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import Boton from './Boton'

type Props = {
  titulo: string
  children: ReactNode
  textoConfirmar: string
  textoCancelar?: string
  cargando?: boolean
  textoCargando?: string
  onConfirmar: () => void
  onCancelar: () => void
}

const FOCALIZABLES = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Modal de confirmación accesible: Esc cierra, el foco queda atrapado dentro y vuelve al botón que lo abrió.
// El foco inicial va a "Cancelar" (la opción segura).
export default function ModalConfirmar({
  titulo,
  children,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  cargando = false,
  textoCargando = 'Procesando...',
  onConfirmar,
  onCancelar,
}: Props) {
  const idTitulo = useId()
  const idDescripcion = useId()
  const caja = useRef<HTMLDivElement>(null)
  const botonCancelar = useRef<HTMLButtonElement>(null)
  const cargandoRef = useRef(cargando)
  cargandoRef.current = cargando

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    botonCancelar.current?.focus()
    const bloqueoAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (!cargandoRef.current) onCancelar()
        return
      }
      if (e.key !== 'Tab' || !caja.current) return
      const items = Array.from(caja.current.querySelectorAll<HTMLElement>(FOCALIZABLES))
      if (items.length === 0) return
      const primero = items[0]
      const ultimo = items[items.length - 1]
      const activo = document.activeElement
      if (e.shiftKey && (activo === primero || !caja.current.contains(activo))) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (activo === ultimo || !caja.current.contains(activo))) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = bloqueoAnterior
      previo?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        ref={caja}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        className="w-full max-w-md rounded-xl border border-borde bg-white p-6 shadow-xl"
      >
        <h2 id={idTitulo} className="text-xl font-bold text-texto">
          {titulo}
        </h2>
        <div id={idDescripcion} className="mt-3 flex flex-col gap-2 text-texto">
          {children}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Boton ref={botonCancelar} type="button" tipo="secundario" onClick={onCancelar} disabled={cargando}>
            {textoCancelar}
          </Boton>
          <Boton type="button" tipo="peligro" onClick={onConfirmar} disabled={cargando}>
            {cargando ? textoCargando : textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  )
}

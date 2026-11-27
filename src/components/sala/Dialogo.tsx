import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

type Props = { titulo: string; children: ReactNode; acciones: ReactNode; onCerrar?: () => void }

// Diálogo modal accesible: role="dialog", foco dentro al abrir, Esc para cerrar y foco atrapado con Tab.
export default function Dialogo({ titulo, children, acciones, onCerrar }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    const caja = ref.current
    const enfocables = () => Array.from(caja?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? [])
    enfocables()[0]?.focus()
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape' && onCerrar) onCerrar()
      if (e.key !== 'Tab') return
      const lista = enfocables()
      if (!lista.length) return
      const primero = lista[0]
      const ultimo = lista[lista.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('keydown', tecla)
      previo?.focus()
    }
  }, [onCerrar])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-texto/55 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-borde bg-white p-6 sm:p-8"
      >
        <h2 id={idTitulo} className="text-xl font-bold text-texto">{titulo}</h2>
        <div className="text-texto-secundario">{children}</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{acciones}</div>
      </div>
    </div>
  )
}

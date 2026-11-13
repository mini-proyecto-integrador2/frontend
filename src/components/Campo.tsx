import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  ayuda?: string
}

export default function Campo({
  label,
  error,
  ayuda,
  id,
  className = '',
  ...resto
}: Props) {
  const idAuto = useId()
  const idCampo = id ?? idAuto
  const idAyuda = `${idCampo}-ayuda`
  const idError = `${idCampo}-error`

  const describedBy =
    [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') ||
    undefined

  const clasesInput = [
    'w-full rounded-lg border bg-white px-4 py-3 text-texto',
    'placeholder:text-texto-secundario',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:border disabled:border-borde disabled:bg-superficie disabled:text-texto-secundario',
    error ? 'border-error' : 'border-borde',
    className,
  ].join(' ')

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={idCampo} className="font-medium text-texto">
        {label}
      </label>

      <input
        id={idCampo}
        className={clasesInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...resto}
      />

      {ayuda && !error && (
        <p id={idAyuda} className="text-sm text-texto-secundario">
          {ayuda}
        </p>
      )}

      {error && (
        <p
          id={idError}
          role="alert"
          className="flex items-start gap-2 text-sm text-error"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
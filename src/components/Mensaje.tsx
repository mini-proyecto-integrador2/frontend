type Props = { tipo: 'error' | 'exito'; children: React.ReactNode }

// Componente "Mensaje" de la guía visual: ícono + color + texto (no depende solo del color).
export default function Mensaje({ tipo, children }: Props) {
  const esError = tipo === 'error'
  return (
    <div
      role={esError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
        esError ? 'border-error bg-error-fondo' : 'border-exito bg-exito-fondo'
      }`}
    >
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${esError ? 'stroke-error' : 'stroke-exito'}`}>
        <circle cx="12" cy="12" r="10" />
        {esError ? (
          <>
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </>
        ) : (
          <path d="m9 12 2 2 4-4" />
        )}
      </svg>
      <p>{children}</p>
    </div>
  )
}

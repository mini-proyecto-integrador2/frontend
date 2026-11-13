type Props = {
  texto?: string
  className?: string
}

export default function Carga({
  texto = 'Cargando...',
  className = '',
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 text-texto-secundario ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" className="opacity-25" />
        <path d="M21 12a9 9 0 0 0-9-9" className="text-primario" />
      </svg>
      <span>{texto}</span>
    </div>
  )
}
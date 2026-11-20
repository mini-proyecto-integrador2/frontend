import { useEffect, useState } from 'react'
import Boton from './Boton'

type Props = {
  id: string
  tipo?: 'primario' | 'secundario'
  className?: string
  onCopiado?: () => void
  onError?: () => void
}

const icono = (ruta: React.ReactNode) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {ruta}
  </svg>
)

// Botón «Copiar ID»: copia al portapapeles y cambia a «ID copiado» unos segundos.
export default function BotonCopiarId({ id, tipo = 'secundario', className = '', onCopiado, onError }: Props) {
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 3000)
    return () => clearTimeout(t)
  }, [copiado])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(id)
      setCopiado(true)
      onCopiado?.()
    } catch {
      onError?.()
    }
  }

  return (
    <Boton type="button" tipo={tipo} className={className} onClick={() => void copiar()}>
      {copiado
        ? icono(<polyline points="5 12 10 17 19 7" />)
        : icono(
            <>
              <rect width="13" height="13" x="9" y="9" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>,
          )}
      {copiado ? 'ID copiado' : 'Copiar ID'}
    </Boton>
  )
}

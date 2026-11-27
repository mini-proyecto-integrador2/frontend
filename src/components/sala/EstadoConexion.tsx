import type { EstadoConexion as Estado } from '../../hooks/useSalaTiempoReal'

const estilos: Record<Estado, [string, string]> = {
  conectado: ['bg-exito-fondo text-exito', 'Conectado'],
  conectando: ['bg-superficie text-texto-secundario', 'Conectando al chat…'],
  reconectando: ['bg-[#FFFBEB] text-advertencia', 'Reconectando…'],
  error: ['bg-error-fondo text-error', 'Sin conexión'],
}

// Indicador del estado de la conexión en tiempo real: punto + texto (no depende solo del color).
export default function EstadoConexion({ estado }: { estado: Estado }) {
  const [clases, texto] = estilos[estado]
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${clases}`}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
      {texto}
    </span>
  )
}

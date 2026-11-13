import { useCallback, useEffect, useRef, useState } from 'react'
import Boton from '../components/Boton'
import Mensaje from '../components/Mensaje'
import { obtenerBaseTecnica, type DatoBaseTecnica } from '../services/api'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'exito'; dato: DatoBaseTecnica }

function formatearFecha(iso: string) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

// TS-00: la app pide un dato a la API, la API lo lee de Firestore y la app lo muestra.
// Tres estados según el prototipo: cargando, error (con «Reintentar») y éxito.
export default function BaseTecnica() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const peticion = useRef<AbortController | null>(null)

  const cargar = useCallback(async () => {
    peticion.current?.abort()
    const controlador = new AbortController()
    peticion.current = controlador
    setEstado({ tipo: 'cargando' })
    try {
      const dato = await obtenerBaseTecnica(controlador.signal)
      if (!controlador.signal.aborted) setEstado({ tipo: 'exito', dato })
    } catch (e) {
      if (!controlador.signal.aborted) setEstado({ tipo: 'error', mensaje: (e as Error).message })
    }
  }, [])

  useEffect(() => {
    void cargar()
    return () => peticion.current?.abort()
  }, [cargar])

  return (
    <div className="px-4 py-8 md:px-16 md:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 md:mx-0">
        <h1 className="text-3xl font-semibold md:text-4xl">Base técnica</h1>
        <p className="text-texto-secundario">
          Esta pantalla comprueba que todo el sistema está conectado: la app pide un dato a la API y la API lo trae de Firestore.
        </p>
        <ol aria-label="Recorrido del dato" className="flex flex-wrap items-center gap-2 text-sm">
          {['App (Vercel)', 'API (Render)', 'Firestore'].map((paso, i) => (
            <li key={paso} className="flex items-center gap-2">
              <span className="rounded-full bg-superficie px-3 py-1.5">{paso}</span>
              {i < 2 && <span aria-hidden="true" className="font-semibold text-texto-secundario">→</span>}
            </li>
          ))}
        </ol>

        <section aria-label="Estado de la conexión" aria-busy={estado.tipo === 'cargando'} className="flex flex-col gap-4 rounded-xl border border-borde p-6">
          {estado.tipo === 'cargando' && (
            <div role="status" className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="size-6 animate-spin rounded-full border-[3px] border-superficie border-t-primario" />
                <p className="font-semibold">Cargando el dato desde la API…</p>
              </div>
              <div aria-hidden="true" className="flex animate-pulse flex-col gap-3">
                <div className="h-4 w-full rounded bg-superficie" />
                <div className="h-4 w-2/3 rounded bg-superficie" />
                <div className="h-4 w-1/2 rounded bg-superficie" />
              </div>
            </div>
          )}

          {estado.tipo === 'error' && (
            <>
              <Mensaje tipo="error">No se pudo cargar el dato.</Mensaje>
              <p className="text-texto-secundario">{estado.mensaje}</p>
              <Boton onClick={cargar} className="w-full md:w-fit">Reintentar</Boton>
            </>
          )}

          {estado.tipo === 'exito' && (
            <>
              <Mensaje tipo="exito">Dato recibido desde Firestore.</Mensaje>
              <dl className="flex flex-col">
                <div className="flex flex-col gap-0.5 border-b border-superficie py-3 md:flex-row md:gap-4">
                  <dt className="text-sm text-texto-secundario md:w-36">Mensaje</dt>
                  <dd className="font-titulo text-xl font-medium">{estado.dato.mensaje}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-superficie py-3 md:flex-row md:gap-4">
                  <dt className="text-sm text-texto-secundario md:w-36">Actualizado</dt>
                  <dd>{formatearFecha(estado.dato.actualizado)}</dd>
                </div>
              </dl>
              <Boton tipo="secundario" onClick={cargar} className="w-full md:w-fit">Recargar dato</Boton>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

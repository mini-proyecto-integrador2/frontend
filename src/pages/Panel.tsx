import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Boton, { BotonEnlace } from '../components/Boton'
import BotonCopiarId from '../components/BotonCopiarId'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import { useSesion } from '../context/SesionContexto'
import { listarMisSalas } from '../services/api'
import type { Sala } from '../services/api'

export default function Panel() {
  const { usuario } = useSesion()
  const primerNombre = usuario?.nombres.trim().split(' ')[0] ?? ''

  const [salas, setSalas] = useState<Sala[] | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setSalas(await listarMisSalas())
    } catch {
      setError('No pudimos cargar tus salones. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="flex flex-col gap-6 rounded-xl border border-borde bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-texto sm:text-3xl">
              {primerNombre ? `Hola, ${primerNombre}` : 'Hola'}
            </h1>
            <p className="mt-2 text-sm text-texto-secundario">
              Este es tu panel. Desde aquí vas a entrar a tus salones de estudio.
            </p>
          </div>
          <BotonEnlace to="/salas/nueva" className="w-full shrink-0 whitespace-nowrap sm:w-auto">
            + Crear sala
          </BotonEnlace>
        </div>

        {cargando && <Carga texto="Cargando tus salones..." className="justify-center" />}

        {!cargando && error && (
          <div className="flex flex-col gap-4">
            <Mensaje tipo="error">{error}</Mensaje>
            <Boton type="button" tipo="secundario" className="w-full sm:w-auto" onClick={() => void cargar()}>
              Reintentar
            </Boton>
          </div>
        )}

        {!cargando && !error && salas && salas.length === 0 && (
          <div className="rounded-xl border border-borde bg-superficie px-6 py-10 text-center">
            <p className="font-bold text-texto">Aún no tienes salones de estudio.</p>
            <p className="mt-1 text-sm text-texto-secundario">
              Crea una sala y compártele el ID a tus compañeros para empezar a estudiar juntos.
            </p>
          </div>
        )}

        {!cargando && !error && salas && salas.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-texto">Tus salones</h2>
            <ul className="flex flex-col gap-3">
              {salas.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-borde p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      to={`/sala/${s.id}`}
                      className="font-titulo text-lg font-semibold text-primario underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2"
                    >
                      {s.nombre}
                    </Link>
                    <p className="text-sm text-texto-secundario">
                      ID: {s.id} · Anfitrión
                    </p>
                  </div>
                  <BotonCopiarId
                    id={s.id}
                    className="w-full sm:w-auto"
                    onCopiado={() => setAviso('ID copiado al portapapeles.')}
                    onError={() => setAviso('')}
                  />
                </li>
              ))}
            </ul>
            <div role="status" aria-live="polite">
              {aviso && <Mensaje tipo="exito">{aviso}</Mensaje>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

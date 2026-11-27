import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Boton, { BotonEnlace } from '../components/Boton'
import BotonCopiarId from '../components/BotonCopiarId'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import { ErrorApi, unirseASala } from '../services/api'
import type { Sala as TipoSala } from '../services/api'

// Interior de la sala. Al abrirla (desde el panel o con un enlace directo) se registra la membresía (US-08).
export default function Sala() {
  const { id = '' } = useParams()
  const { state } = useLocation()
  const [sala, setSala] = useState<TipoSala | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setSala(await unirseASala(id))
    } catch (e) {
      setError(
        e instanceof ErrorApi && e.status === 404
          ? 'No encontramos esa sala. Revisa el ID e inténtalo de nuevo.'
          : 'No pudimos abrir la sala. Revisa tu conexión e inténtalo de nuevo.',
      )
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="flex flex-col gap-6 rounded-xl border border-borde bg-white p-6 sm:p-8">
        {cargando && <Carga texto="Abriendo la sala..." className="justify-center" />}

        {!cargando && error && (
          <>
            <Mensaje tipo="error">{error}</Mensaje>
            <Boton type="button" onClick={() => void cargar()}>Reintentar</Boton>
            <BotonEnlace to="/panel" tipo="secundario">Volver al panel</BotonEnlace>
          </>
        )}

        {!cargando && !error && sala && (
          <>
            {state?.recienCreada && (
              <Mensaje tipo="exito">Sala creada. Comparte el ID con tus compañeros para que se unan.</Mensaje>
            )}
            {state?.recienUnido && (
              <Mensaje tipo="exito">Te uniste a la sala. Ya puedes estudiar con el grupo.</Mensaje>
            )}
            <div>
              <h1 className="text-2xl font-bold text-texto sm:text-3xl">{sala.nombre}</h1>
              <p className="mt-2 text-sm text-texto-secundario">
                {sala.esCreador === false
                  ? `Te uniste como invitado. Anfitrión: ${sala.anfitrion.username}.`
                  : 'Eres el anfitrión de esta sala.'}
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-borde bg-superficie p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-texto-secundario">ID de la sala</p>
                <p className="font-titulo text-2xl font-semibold text-texto">{sala.id}</p>
              </div>
              <BotonCopiarId
                id={sala.id}
                tipo="primario"
                className="w-full sm:w-auto"
                onCopiado={() => setAviso('ID copiado al portapapeles.')}
              />
            </div>
            <div role="status" aria-live="polite">
              {aviso && <Mensaje tipo="exito">{aviso}</Mensaje>}
            </div>
            <BotonEnlace to="/panel" tipo="secundario">Volver al panel</BotonEnlace>
          </>
        )}
      </div>
    </section>
  )
}

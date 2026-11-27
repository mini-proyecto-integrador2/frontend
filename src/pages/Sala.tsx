import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Boton, { BotonEnlace } from '../components/Boton'
import BotonCopiarId from '../components/BotonCopiarId'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import Chat from '../components/sala/Chat'
import Dialogo from '../components/sala/Dialogo'
import EditarSala from '../components/sala/EditarSala'
import EstadoConexion from '../components/sala/EstadoConexion'
import Participantes from '../components/sala/Participantes'
import { useHistorial } from '../hooks/useHistorial'
import { useSalaTiempoReal } from '../hooks/useSalaTiempoReal'
import { eliminarSala, ErrorApi, unirseASala } from '../services/api'
import type { Sala as TipoSala } from '../services/api'
import { auth } from '../services/firebase'

// Interior de la sala: zonas de chat, participantes y acciones.
// Al abrirla (desde el panel o con un enlace directo) se registra la membresía (US-08) y se conecta al tiempo real (US-10).
export default function Sala() {
  const { id = '' } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [sala, setSala] = useState<TipoSala | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [editando, setEditando] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')
  const [salaEliminada, setSalaEliminada] = useState(false)
  const miUid = auth.currentUser?.uid

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

  // US-07: el anfitrión cambió el nombre o eliminó la sala (aviso desde el tiempo real).
  const tiempoReal = useSalaTiempoReal(sala?.id ?? null, {
    onSalaActualizada: (nueva) => {
      setSala((actual) => (actual ? { ...actual, nombre: nueva.nombre } : actual))
      setAviso(`El anfitrión cambió el nombre de la sala a «${nueva.nombre}».`)
    },
    onSalaEliminada: () => setSalaEliminada(true),
  })
  const historial = useHistorial(sala?.id ?? null, tiempoReal.agregarMensajes)

  async function eliminar() {
    if (!sala) return
    setEliminando(true)
    setErrorEliminar('')
    try {
      await eliminarSala(sala.id)
      await tiempoReal.avisar('sala:eliminada')
      await tiempoReal.salir()
      navigate('/panel', { state: { salaEliminada: sala.nombre } })
    } catch (e) {
      setErrorEliminar(
        e instanceof ErrorApi && e.status === 403
          ? 'Solo el anfitrión de la sala puede eliminarla.'
          : 'No pudimos eliminar la sala. Revisa tu conexión e inténtalo de nuevo.',
      )
      setEliminando(false)
    }
  }

  async function salir() {
    await tiempoReal.salir()
    navigate('/panel')
  }

  if (cargando) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <Carga texto="Abriendo la sala..." className="justify-center" />
      </section>
    )
  }

  if (error || !sala) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="flex flex-col gap-4 rounded-xl border border-borde bg-white p-6 sm:p-8">
          <Mensaje tipo="error">{error || 'No pudimos abrir la sala.'}</Mensaje>
          <Boton type="button" onClick={() => void cargar()}>Reintentar</Boton>
          <BotonEnlace to="/panel" tipo="secundario">Volver al panel</BotonEnlace>
        </div>
      </section>
    )
  }

  const esAnfitrion = sala.esCreador !== false

  if (editando) {
    return (
      <section className="w-full px-4 py-10">
        <EditarSala
          sala={sala}
          onCancelar={() => setEditando(false)}
          onGuardada={(nueva) => {
            setSala((actual) => (actual ? { ...actual, nombre: nueva.nombre } : actual))
            setEditando(false)
            setAviso('Cambios guardados. Todos ven el nuevo nombre.')
            void tiempoReal.avisar('sala:actualizada')
          }}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:py-10">
      {state?.recienCreada && (
        <Mensaje tipo="exito">Sala creada. Comparte el ID con tus compañeros para que se unan.</Mensaje>
      )}
      {state?.recienUnido && (
        <Mensaje tipo="exito">Te uniste a la sala. Ya puedes chatear con el grupo.</Mensaje>
      )}
      {tiempoReal.estado === 'reconectando' && (
        <div role="status" className="rounded-lg border border-advertencia bg-[#FFFBEB] px-4 py-3 text-texto">
          Se perdió la conexión. Estamos reconectándote a la sala…
        </div>
      )}
      {tiempoReal.estado === 'error' && <Mensaje tipo="error">{tiempoReal.errorConexion}</Mensaje>}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-texto sm:text-3xl">{sala.nombre}</h1>
            <EstadoConexion estado={tiempoReal.estado} />
          </div>
          <p className="mt-1 text-sm text-texto-secundario">
            ID: {sala.id} ·{' '}
            {esAnfitrion ? 'Eres el anfitrión' : `Te uniste como invitado · Anfitrión: ${sala.anfitrion.username}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotonCopiarId id={sala.id} onCopiado={() => setAviso('ID copiado al portapapeles.')} />
          {esAnfitrion && (
            <>
              <Boton type="button" tipo="secundario" onClick={() => setEditando(true)}>Editar sala</Boton>
              <Boton
                type="button"
                tipo="secundario"
                className="border-error! text-error! hover:bg-error-fondo!"
                onClick={() => {
                  setErrorEliminar('')
                  setConfirmarEliminar(true)
                }}
              >
                Eliminar sala
              </Boton>
            </>
          )}
          <Boton type="button" tipo="secundario" onClick={() => void salir()}>
            Salir de la sala
          </Boton>
        </div>
      </div>
      <div role="status" aria-live="polite">
        {aviso && <Mensaje tipo="exito">{aviso}</Mensaje>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="order-2 lg:order-1">
          <Chat
            mensajes={tiempoReal.mensajes}
            miUid={miUid}
            estado={tiempoReal.estado}
            onEnviar={tiempoReal.enviar}
            cargando={historial.cargando}
            encabezadoLista={
              <>
                {historial.cargando && <Carga texto="Cargando mensajes anteriores…" className="m-auto" />}
                {!historial.cargando && historial.error && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p role="alert" className="text-sm text-error">⚠ {historial.error}</p>
                    <Boton type="button" tipo="secundario" onClick={() => void historial.cargar()}>Reintentar</Boton>
                  </div>
                )}
                {!historial.cargando && historial.hayMas && (
                  <div className="flex justify-center">
                    <Boton type="button" tipo="secundario" disabled={historial.cargandoAnteriores} onClick={() => void historial.cargarAnteriores()}>
                      {historial.cargandoAnteriores ? 'Cargando…' : 'Ver mensajes anteriores'}
                    </Boton>
                  </div>
                )}
              </>
            }
          />
        </div>
        <div className="order-1 lg:order-2">
          <Participantes participantes={tiempoReal.participantes} anfitrionUid={sala.anfitrion.uid} miUid={miUid} />
        </div>
      </div>

      {confirmarEliminar && (
        <Dialogo
          titulo={`¿Eliminar la sala «${sala.nombre}»?`}
          onCerrar={eliminando ? undefined : () => setConfirmarEliminar(false)}
          acciones={
            <>
              <Boton type="button" tipo="secundario" disabled={eliminando} onClick={() => setConfirmarEliminar(false)}>
                Cancelar
              </Boton>
              <Boton type="button" tipo="peligro" disabled={eliminando} onClick={() => void eliminar()}>
                {eliminando ? 'Eliminando…' : 'Eliminar sala'}
              </Boton>
            </>
          }
        >
          <p>Se borrarán la sala y todos sus mensajes, y los participantes conectados saldrán de ella. Esta acción no se puede deshacer.</p>
          {errorEliminar && <div className="mt-3"><Mensaje tipo="error">{errorEliminar}</Mensaje></div>}
        </Dialogo>
      )}

      {salaEliminada && (
        <Dialogo
          titulo="La sala fue eliminada"
          acciones={<BotonEnlace to="/panel">Volver al panel</BotonEnlace>}
        >
          <p>El anfitrión eliminó esta sala. Ya no puedes enviar mensajes aquí.</p>
        </Dialogo>
      )}
    </section>
  )
}

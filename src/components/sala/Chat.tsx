import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import Boton from '../Boton'
import { TEXTO_MAXIMO } from '../../services/tiempoReal'
import type { MensajeChat, RespuestaAck } from '../../services/tiempoReal'
import type { EstadoConexion } from '../../hooks/useSalaTiempoReal'

type Props = {
  mensajes: MensajeChat[]
  miUid?: string
  estado: EstadoConexion
  onEnviar: (texto: string) => Promise<RespuestaAck>
  encabezadoLista?: ReactNode // US-11: carga del historial y «mensajes anteriores»
  cargando?: boolean
}

const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

// US-10: zona de chat. Los mensajes propios van a la derecha en azul; los de los demás, a la izquierda.
export default function Chat({ mensajes, miUid, estado, onEnviar, encabezadoLista, cargando = false }: Props) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const listaRef = useRef<HTMLDivElement>(null)
  const entradaRef = useRef<HTMLInputElement>(null)
  const idEntrada = useId()
  const idError = `${idEntrada}-error`
  const conectado = estado === 'conectado'

  // Bajar al último mensaje cuando llega uno nuevo.
  useEffect(() => {
    const lista = listaRef.current
    if (lista) lista.scrollTop = lista.scrollHeight
  }, [mensajes.length])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    const r = await onEnviar(texto)
    setEnviando(false)
    if (r.ok) {
      setTexto('')
      setError('')
    } else {
      setError(r.error?.message ?? 'No se pudo enviar el mensaje. Intenta de nuevo.')
    }
    entradaRef.current?.focus()
  }

  return (
    <section aria-labelledby="titulo-chat" className="flex min-w-0 flex-col gap-4 rounded-xl border border-borde bg-white p-4 sm:p-5">
      <h2 id="titulo-chat" className="text-lg font-semibold text-texto">Chat</h2>

      <div
        ref={listaRef}
        role="log"
        aria-live="polite"
        aria-label="Mensajes de la sala"
        tabIndex={0}
        className="flex max-h-[28rem] min-h-[18rem] flex-col gap-3 overflow-y-auto rounded-lg bg-[#FAFAFB] p-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro sm:p-4"
      >
        {encabezadoLista}
        {!cargando && mensajes.length === 0 && (
          <div className="m-auto max-w-xs text-center">
            <p className="font-titulo font-semibold text-texto">Aún no hay mensajes</p>
            <p className="mt-1 text-sm text-texto-secundario">Escribe el primero para empezar la conversación.</p>
          </div>
        )}
        {mensajes.map((m) => {
          const propio = m.autor.uid === miUid
          return (
            <div key={m.id} className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 sm:max-w-[70%] ${propio ? 'bg-primario text-white' : 'bg-superficie text-texto'}`}>
                <p className={`text-xs font-semibold ${propio ? 'text-white' : 'text-texto-secundario'}`}>
                  {propio ? 'Tú' : m.autor.username} · <time dateTime={m.enviado}>{hora(m.enviado)}</time>
                </p>
                <p className="whitespace-pre-wrap break-words">{m.texto}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={(e) => void enviar(e)} noValidate className="flex flex-col gap-2">
        <label htmlFor={idEntrada} className="sr-only">Escribe un mensaje</label>
        <div className="flex gap-2">
          <input
            ref={entradaRef}
            id={idEntrada}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              if (error) setError('')
            }}
            maxLength={TEXTO_MAXIMO}
            autoComplete="off"
            placeholder={conectado ? 'Escribe un mensaje y presiona Enter' : 'Esperando conexión…'}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
            className={`min-w-0 flex-1 rounded-lg border bg-white px-4 py-3 text-texto placeholder:text-texto-secundario focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2 ${error ? 'border-error' : 'border-borde'}`}
          />
          <Boton type="submit" disabled={!conectado || enviando} className="shrink-0">
            {enviando ? 'Enviando…' : 'Enviar'}
          </Boton>
        </div>
        {error && (
          <p id={idError} role="alert" className="text-sm text-error">⚠ {error}</p>
        )}
      </form>
    </section>
  )
}

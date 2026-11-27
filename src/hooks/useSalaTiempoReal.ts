import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { crearConexion, emitir, TEXTO_MAXIMO } from '../services/tiempoReal'
import type { Autor, MensajeChat, RespuestaAck, Sala } from '../services/tiempoReal'

export type EstadoConexion = 'conectando' | 'conectado' | 'reconectando' | 'error'

type Opciones = {
  onSalaActualizada?: (sala: Sala) => void
  onSalaEliminada?: () => void
}

// US-10: conexión a una sala en tiempo real. Se une al conectar y vuelve a unirse al reconectar.
export function useSalaTiempoReal(salaId: string | null, opciones: Opciones = {}) {
  const socketRef = useRef<Socket | null>(null)
  const opcionesRef = useRef(opciones)
  useEffect(() => {
    opcionesRef.current = opciones
  })
  const [estado, setEstado] = useState<EstadoConexion>('conectando')
  const [errorConexion, setErrorConexion] = useState('')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [participantes, setParticipantes] = useState<Autor[]>([])

  // Agrega mensajes sin repetir (el servidor también le devuelve su mensaje a quien lo envió).
  const agregarMensajes = useCallback((nuevos: MensajeChat[], alInicio = false) => {
    setMensajes((actuales) => {
      const ids = new Set(actuales.map((m) => m.id))
      const sinRepetir = nuevos.filter((m) => !ids.has(m.id))
      if (!sinRepetir.length) return actuales
      const todos = alInicio ? [...sinRepetir, ...actuales] : [...actuales, ...sinRepetir]
      return todos.sort((a, b) => a.enviado.localeCompare(b.enviado))
    })
  }, [])

  useEffect(() => {
    if (!salaId) return
    let socket: Socket
    try {
      socket = crearConexion()
    } catch (e) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado('error')
      setErrorConexion(e instanceof Error ? e.message : 'No se pudo conectar al chat.')
      return
    }
    socketRef.current = socket

    socket.on('connect', async () => {
      const r = await emitir(socket, 'sala:unirse', { salaId })
      if (r.ok) {
        setEstado('conectado')
        setErrorConexion('')
        setParticipantes((r.participantes as Autor[]) ?? [])
      } else {
        setEstado('error')
        setErrorConexion(r.error?.message ?? 'No pudimos entrar al chat de la sala.')
      }
    })
    socket.on('disconnect', (motivo) => {
      // Si fue el cliente quien cerró (salir de la sala), no se muestra como error.
      if (motivo !== 'io client disconnect') setEstado('reconectando')
    })
    socket.on('connect_error', (e) => {
      if (e.message === 'UNAUTHORIZED') {
        setEstado('error')
        setErrorConexion('Tu sesión venció. Ingresa de nuevo para usar el chat.')
      } else if (e.message === 'PROFILE_NOT_FOUND') {
        setEstado('error')
        setErrorConexion('Completa tu perfil para usar el chat.')
      } else {
        setEstado('reconectando')
      }
    })
    socket.on('chat:mensaje', (m: MensajeChat) => agregarMensajes([m]))
    socket.on('sala:presencia', (p: { participantes: Autor[] }) => setParticipantes(p.participantes ?? []))
    socket.on('sala:actualizada', (p: { sala: Sala }) => opcionesRef.current.onSalaActualizada?.(p.sala))
    socket.on('sala:eliminada', () => opcionesRef.current.onSalaEliminada?.())

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [salaId, agregarMensajes])

  const enviar = useCallback(async (texto: string): Promise<RespuestaAck> => {
    const limpio = texto.trim()
    if (!limpio) return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Escribe un mensaje antes de enviarlo.' } }
    if (limpio.length > TEXTO_MAXIMO) {
      return { ok: false, error: { code: 'VALIDATION_ERROR', message: `El mensaje puede tener máximo ${TEXTO_MAXIMO} caracteres.` } }
    }
    const socket = socketRef.current
    if (!socket?.connected) return { ok: false, error: { code: 'OFFLINE', message: 'Sin conexión con el chat. Espera a que se reconecte.' } }
    const r = await emitir(socket, 'chat:mensaje', { texto: limpio })
    if (r.ok && r.mensaje) agregarMensajes([r.mensaje as MensajeChat])
    return r
  }, [agregarMensajes])

  const salir = useCallback(async () => {
    const socket = socketRef.current
    if (socket?.connected) await emitir(socket, 'sala:salir')
    socket?.disconnect()
  }, [])

  // Para US-07: avisar a los demás después de editar o eliminar la sala por la API.
  const avisar = useCallback(async (evento: 'sala:actualizada' | 'sala:eliminada') => {
    const socket = socketRef.current
    if (socket?.connected && salaId) return emitir(socket, evento, { salaId })
    return { ok: false }
  }, [salaId])

  return { estado, errorConexion, mensajes, participantes, enviar, salir, avisar, agregarMensajes }
}

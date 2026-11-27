// Cliente del servidor de tiempo real (backend-realtime, Socket.IO en Render).
// La URL viene de VITE_REALTIME_URL. El token de Firebase se pide en cada conexión y reconexión.
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { auth } from './firebase'
import type { Sala } from './api'

const URL_TIEMPO_REAL = (import.meta.env.VITE_REALTIME_URL ?? '').replace(/\/$/, '')

export type Autor = { uid: string; username: string }

export type MensajeChat = {
  id: string
  salaId: string
  autor: Autor
  texto: string
  enviado: string
}

export type RespuestaAck = { ok: boolean; error?: { code: string; message: string }; [clave: string]: unknown }

export const TEXTO_MAXIMO = 500

export function crearConexion(): Socket {
  if (!URL_TIEMPO_REAL) throw new Error('Falta configurar VITE_REALTIME_URL.')
  return io(URL_TIEMPO_REAL, {
    // Función: así cada reconexión manda un token vigente (los de Firebase vencen en 1 hora).
    auth: (cb) => {
      const usuario = auth.currentUser
      if (!usuario) return cb({})
      void usuario.getIdToken().then((token) => cb({ token }))
    },
    // Render (plan gratis) puede tardar hasta un minuto en despertar.
    timeout: 60_000,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
  })
}

// emit con confirmación (ack) y tiempo máximo, para no dejar la interfaz esperando para siempre.
export function emitir(socket: Socket, evento: string, datos?: unknown): Promise<RespuestaAck> {
  return new Promise((resolver) => {
    socket.timeout(15_000).emit(evento, datos, (err: Error | null, respuesta: RespuestaAck) => {
      if (err) resolver({ ok: false, error: { code: 'TIMEOUT', message: 'El servidor no respondió. Intenta de nuevo.' } })
      else resolver(respuesta)
    })
  })
}

export type { Sala }

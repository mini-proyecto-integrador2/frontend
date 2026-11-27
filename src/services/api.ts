// Cliente de la API (backend-api en Render). La URL viene de la variable de entorno VITE_API_URL.
// El frontend NUNCA consulta Firestore directamente: todo pasa por la API.
import { auth } from './firebase'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type DatoBaseTecnica = {
  mensaje: string
  actualizado: string
}

export type Perfil = {
  uid: string
  nombres: string
  apellidos: string
  username: string
  avatar: string
  correo: string
  creado: string
}

export class ErrorApi extends Error {
  status?: number
  codigo?: string
  constructor(message: string, status?: number, codigo?: string) {
    super(message)
    this.status = status
    this.codigo = codigo
  }
}

// Render (plan gratis) puede tardar ~50 s en despertar, por eso el tiempo de espera es amplio.
const TIEMPO_MAXIMO_MS = 60_000

type Opciones = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  cuerpo?: unknown
  conToken?: boolean
  signal?: AbortSignal
}

export async function llamarApi<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, conToken = false, signal } = opciones
  if (!API_URL) throw new ErrorApi('Falta configurar VITE_API_URL.')

  const cabeceras: Record<string, string> = {}
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (conToken) {
    const usuario = auth.currentUser
    if (!usuario) throw new ErrorApi('Tu sesión venció. Ingresa de nuevo.', 401, 'UNAUTHORIZED')
    cabeceras.Authorization = `Bearer ${await usuario.getIdToken()}`
  }

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort('tiempo'), TIEMPO_MAXIMO_MS)
  signal?.addEventListener('abort', () => controlador.abort('cancelado'))

  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: controlador.signal,
    })
    const datos = await respuesta.json().catch(() => null)
    if (!respuesta.ok) {
      throw new ErrorApi(
        datos?.error?.message ?? 'La API respondió con un error.',
        respuesta.status,
        datos?.error?.code,
      )
    }
    return datos as T
  } catch (e) {
    if (e instanceof ErrorApi) throw e
    if (controlador.signal.aborted && controlador.signal.reason === 'tiempo') {
      throw new ErrorApi('La API no respondió a tiempo. Puede que el servidor esté despertando; intenta de nuevo en unos segundos.')
    }
    throw new ErrorApi('No se pudo conectar con la API. Revisa tu conexión.')
  } finally {
    clearTimeout(temporizador)
  }
}

export function obtenerBaseTecnica(signal?: AbortSignal) {
  return llamarApi<DatoBaseTecnica>('/api/base', { signal })
}

// --- Usuarios (TS-01) ---

export type DatosRegistro = {
  nombres: string
  apellidos: string
  username: string
  correo: string
  contrasena: string
  avatar: string
}

export async function registrarUsuario(datos: DatosRegistro): Promise<Perfil> {
  const r = await llamarApi<{ perfil: Perfil }>('/api/auth/registro', { metodo: 'POST', cuerpo: datos })
  return r.perfil
}

export async function crearPerfilGoogle(username: string, avatar?: string): Promise<Perfil> {
  const r = await llamarApi<{ perfil: Perfil }>('/api/usuarios/perfil', {
    metodo: 'POST',
    cuerpo: avatar ? { username, avatar } : { username },
    conToken: true,
  })
  return r.perfil
}

export async function obtenerMiPerfil(): Promise<Perfil> {
  const r = await llamarApi<{ perfil: Perfil }>('/api/usuarios/yo', { conToken: true })
  return r.perfil
}

export async function usernameDisponible(username: string): Promise<boolean> {
  const r = await llamarApi<{ disponible: boolean }>(
    `/api/usuarios/disponible?usuario=${encodeURIComponent(username)}`,
  )
  return r.disponible
}

// --- Perfil (US-04) y cuenta (US-05) ---

export type CambiosPerfil = Partial<Pick<Perfil, 'nombres' | 'apellidos' | 'username' | 'avatar'>>

export async function actualizarMiPerfil(cambios: CambiosPerfil): Promise<Perfil> {
  const r = await llamarApi<{ perfil: Perfil }>('/api/usuarios/yo', {
    metodo: 'PATCH',
    cuerpo: cambios,
    conToken: true,
  })
  return r.perfil
}

// DELETE /api/usuarios/yo responde 204 (sin cuerpo): borra la cuenta, el perfil y el nombre de usuario.
export async function eliminarMiCuenta(): Promise<void> {
  await llamarApi<null>('/api/usuarios/yo', { metodo: 'DELETE', conToken: true })
}


// --- Salas (US-06, US-07, US-08) ---
// Contrato publicado en Swagger (backend-api). esCreador indica si quien consulta es el anfitrión.

export type Sala = {
  id: string
  nombre: string
  anfitrion: { uid: string; username: string }
  creada: string
  esCreador?: boolean
}

export async function crearSala(nombre: string): Promise<Sala> {
  const r = await llamarApi<{ sala: Sala }>('/api/salas', {
    metodo: 'POST',
    cuerpo: { nombre },
    conToken: true,
  })
  return r.sala
}

export async function listarMisSalas(): Promise<Sala[]> {
  const r = await llamarApi<{ salas: Sala[] }>('/api/salas', { conToken: true })
  return r.salas
}

export async function obtenerSala(id: string): Promise<Sala> {
  const r = await llamarApi<{ sala: Sala }>(`/api/salas/${encodeURIComponent(id)}`, { conToken: true })
  return r.sala
}

// US-08: unirse a una sala con su ID. Es idempotente: si ya estás dentro (o eres el anfitrión) responde igual.
export async function unirseASala(id: string): Promise<Sala> {
  const r = await llamarApi<{ sala: Sala }>(`/api/salas/${encodeURIComponent(id.trim().toUpperCase())}/unirse`, {
    metodo: 'POST',
    conToken: true,
  })
  return r.sala
}

// US-11: historial de la sala, del más viejo al más nuevo. Máximo 100 por página; `antes` pide mensajes anteriores.
export type MensajeHistorial = {
  id: string
  salaId: string
  autor: { uid: string; username: string }
  texto: string
  enviado: string
}

export const LIMITE_HISTORIAL = 50

export async function obtenerHistorial(
  salaId: string,
  antes?: string,
): Promise<{ mensajes: MensajeHistorial[]; hayMas: boolean }> {
  const params = new URLSearchParams({ limite: String(LIMITE_HISTORIAL) })
  if (antes) params.set('antes', antes)
  return llamarApi(`/api/salas/${encodeURIComponent(salaId)}/mensajes?${params}`, { conToken: true })
}

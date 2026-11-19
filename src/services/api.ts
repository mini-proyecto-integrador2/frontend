// Cliente de la API (backend-api en Render). La URL viene de la variable de entorno VITE_API_URL.
// El frontend NUNCA consulta Firestore directamente: todo pasa por la API.
import { auth } from './firebase'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type DatoBaseTecnica = {
  mensaje: string
  documento: string
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

export async function crearPerfilGoogle(username: string): Promise<Perfil> {
  const r = await llamarApi<{ perfil: Perfil }>('/api/usuarios/perfil', {
    metodo: 'POST',
    cuerpo: { username },
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
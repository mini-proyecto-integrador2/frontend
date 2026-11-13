// Cliente de la API (backend-api en Render). La URL viene de la variable de entorno VITE_API_URL.
// El frontend NUNCA consulta Firestore directamente: todo pasa por la API.

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type DatoBaseTecnica = {
  mensaje: string
  actualizado: string
}

export class ErrorApi extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

// Render (plan gratis) puede tardar ~50 s en despertar, por eso el tiempo de espera es amplio.
const TIEMPO_MAXIMO_MS = 60_000

export async function obtenerBaseTecnica(signal?: AbortSignal): Promise<DatoBaseTecnica> {
  if (!API_URL) throw new ErrorApi('Falta configurar VITE_API_URL.')

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort('tiempo'), TIEMPO_MAXIMO_MS)
  signal?.addEventListener('abort', () => controlador.abort('cancelado'))

  try {
    const respuesta = await fetch(`${API_URL}/api/base`, { signal: controlador.signal })
    const cuerpo = await respuesta.json().catch(() => null)
    if (!respuesta.ok) {
      throw new ErrorApi(cuerpo?.error?.message ?? 'La API respondió con un error.', respuesta.status)
    }
    return cuerpo as DatoBaseTecnica
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

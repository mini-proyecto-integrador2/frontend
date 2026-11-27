import { useCallback, useEffect, useState } from 'react'
import { obtenerHistorial } from '../services/api'
import type { MensajeHistorial } from '../services/api'

// US-11: carga los últimos mensajes al abrir la sala y permite pedir los anteriores.
// Los mensajes se entregan a quien los muestra (el mismo listado del chat en tiempo real, sin repetir).
export function useHistorial(salaId: string | null, agregar: (mensajes: MensajeHistorial[], alInicio?: boolean) => void) {
  const [cargando, setCargando] = useState(true)
  const [cargandoAnteriores, setCargandoAnteriores] = useState(false)
  const [error, setError] = useState('')
  const [hayMas, setHayMas] = useState(false)
  const [masViejo, setMasViejo] = useState<string | undefined>()

  const cargar = useCallback(async () => {
    if (!salaId) return
    setCargando(true)
    setError('')
    try {
      const r = await obtenerHistorial(salaId)
      agregar(r.mensajes, true)
      setHayMas(r.hayMas)
      setMasViejo(r.mensajes[0]?.enviado)
    } catch {
      setError('No pudimos cargar los mensajes anteriores. Los nuevos sí te van a llegar.')
    } finally {
      setCargando(false)
    }
  }, [salaId, agregar])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  const cargarAnteriores = useCallback(async () => {
    if (!salaId || !masViejo) return
    setCargandoAnteriores(true)
    try {
      const r = await obtenerHistorial(salaId, masViejo)
      agregar(r.mensajes, true)
      setHayMas(r.hayMas)
      if (r.mensajes[0]) setMasViejo(r.mensajes[0].enviado)
    } catch {
      setError('No pudimos cargar más mensajes. Intenta de nuevo.')
    } finally {
      setCargandoAnteriores(false)
    }
  }, [salaId, masViejo, agregar])

  return { cargando, cargandoAnteriores, error, hayMas, cargar, cargarAnteriores }
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton from './Boton'
import Campo from './Campo'
import { ErrorApi, unirseASala } from '../services/api'

// US-08: formulario para unirse a una sala con el ID que comparte el anfitrión.
export default function UnirseSala() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [uniendo, setUniendo] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const limpio = id.trim().toUpperCase()
    if (!limpio) {
      setError('Escribe el ID de la sala para unirte.')
      return
    }
    setError('')
    setUniendo(true)
    try {
      const sala = await unirseASala(limpio)
      navigate(`/sala/${sala.id}`, { state: { recienUnido: !sala.esCreador } })
    } catch (err) {
      setError(
        err instanceof ErrorApi && err.status === 404
          ? `No encontramos una sala con el ID ${limpio}. Revisa que esté bien escrito o pídeselo al anfitrión.`
          : err instanceof ErrorApi && err.message
            ? err.message
            : 'No pudimos unirte a la sala. Revisa tu conexión e inténtalo de nuevo.',
      )
      setUniendo(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void enviar(e)}
      noValidate
      aria-labelledby="titulo-unirse"
      className="flex flex-col gap-3 rounded-xl bg-superficie p-4 sm:p-5"
    >
      <h2 id="titulo-unirse" className="text-lg font-semibold text-texto">
        Unirse a una sala
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Campo
            label="ID de la sala"
            name="idSala"
            value={id}
            onChange={(e) => {
              setId(e.target.value)
              if (error) setError('')
            }}
            placeholder="Ej.: THG-1338"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            ayuda="Te lo comparte el anfitrión de la sala."
            error={error}
            disabled={uniendo}
          />
        </div>
        <Boton type="submit" className="w-full whitespace-nowrap sm:mt-8 sm:w-auto" disabled={uniendo}>
          {uniendo ? 'Uniéndote…' : 'Unirse'}
        </Boton>
      </div>
    </form>
  )
}

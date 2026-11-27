import { useState } from 'react'
import type { FormEvent } from 'react'
import Boton from '../Boton'
import Campo from '../Campo'
import Mensaje from '../Mensaje'
import { editarSala, ErrorApi } from '../../services/api'
import type { Sala } from '../../services/api'

type Props = { sala: Sala; onGuardada: (sala: Sala) => void; onCancelar: () => void }

const MIN = 3
const MAX = 40

// US-07: formulario para cambiar el nombre de la sala (el ID no cambia).
export default function EditarSala({ sala, onGuardada, onCancelar }: Props) {
  const [nombre, setNombre] = useState(sala.nombre)
  const [errorCampo, setErrorCampo] = useState('')
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const limpio = nombre.trim().replace(/\s+/g, ' ')
    if (limpio.length < MIN || limpio.length > MAX) {
      setErrorCampo(`El nombre debe tener entre ${MIN} y ${MAX} caracteres.`)
      return
    }
    setErrorCampo('')
    setErrorGeneral('')
    setGuardando(true)
    try {
      onGuardada(await editarSala(sala.id, limpio))
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 403) setErrorGeneral('Solo el anfitrión de la sala puede editarla.')
      else if (err instanceof ErrorApi && err.status === 400) setErrorCampo(err.message)
      else setErrorGeneral('No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-borde bg-white p-6 sm:p-8">
      <form onSubmit={(e) => void guardar(e)} noValidate className="flex flex-col gap-5">
        {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}
        <div>
          <h1 className="text-2xl font-bold text-texto sm:text-3xl">Editar sala</h1>
          <p className="mt-2 text-sm text-texto-secundario">Cambia el nombre de la sala. El ID se mantiene igual: {sala.id}.</p>
        </div>
        <Campo
          label="Nombre de la sala *"
          name="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (errorCampo) setErrorCampo('')
          }}
          maxLength={MAX}
          autoComplete="off"
          required
          ayuda={`Entre ${MIN} y ${MAX} caracteres.`}
          error={errorCampo}
          disabled={guardando}
          autoFocus
        />
        <div className="flex flex-col gap-3">
          <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</Boton>
          <Boton type="button" tipo="secundario" onClick={onCancelar} disabled={guardando}>Cancelar</Boton>
        </div>
      </form>
    </div>
  )
}

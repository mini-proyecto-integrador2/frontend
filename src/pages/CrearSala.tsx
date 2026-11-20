import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton, { BotonEnlace } from '../components/Boton'
import Campo from '../components/Campo'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import { ErrorApi, crearSala } from '../services/api'

const MSG_NOMBRE = 'Escribe un nombre para tu sala (entre 3 y 40 caracteres).'
const MSG_CONEXION = 'No pudimos crear la sala. Revisa tu conexión e inténtalo de nuevo.'

export default function CrearSala() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [errorGeneral, setErrorGeneral] = useState('')
  const [creando, setCreando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (creando) return
    setErrorGeneral('')

    const limpio = nombre.trim()
    if (limpio.length < 3 || limpio.length > 40) {
      setErrorCampo(MSG_NOMBRE)
      document.getElementById('sala-nombre')?.focus()
      return
    }

    setErrorCampo('')
    setCreando(true)
    try {
      const sala = await crearSala(limpio)
      navigate(`/sala/${sala.id}`, { state: { recienCreada: true } })
    } catch (e) {
      if (e instanceof ErrorApi && e.codigo === 'VALIDATION_ERROR') {
        setErrorCampo(MSG_NOMBRE)
        document.getElementById('sala-nombre')?.focus()
      } else {
        setErrorGeneral(MSG_CONEXION)
      }
    } finally {
      setCreando(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">Crear sala</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Ponle un nombre a tu sala de estudio. Tú serás el anfitrión.
        </p>

        <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
          {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

          <Campo
            id="sala-nombre"
            label="Nombre de la sala *"
            placeholder="Ej.: Cálculo II – parcial"
            ayuda="Entre 3 y 40 caracteres."
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errorCampo) setErrorCampo('')
            }}
            error={errorCampo || undefined}
          />

          <div className="flex flex-col gap-4">
            <Boton type="submit" tipo="primario" className="w-full" disabled={creando}>
              Crear sala
            </Boton>
            {creando && <Carga texto="Creando tu sala..." className="justify-center" />}
            <BotonEnlace to="/panel" tipo="secundario" className="w-full">
              Cancelar
            </BotonEnlace>
          </div>
        </form>
      </div>
    </section>
  )
}

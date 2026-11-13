import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton from '../components/Boton'
import Campo from '../components/Campo'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import SelectorAvatar from '../components/SelectorAvatar'
import type { AvatarId } from '../components/SelectorAvatar'
import { useSesion } from '../context/SesionContexto'

const MSG_BANNER_ERROR = 'No pudimos guardar tu nombre de usuario. Revisa el campo marcado.'
const MSG_USUARIO_OCUPADO = 'Ese nombre de usuario ya está en uso. Prueba con otro.'
const MSG_USUARIO_FORMATO = 'Usa entre 3 y 20 caracteres: letras, números o guion bajo.'

// Datos simulados (Bloque 3). En el Bloque 4 se reemplazan por la API.
const USUARIO_SIMULADO_OCUPADO = 'camila_rojas'
const CORREO_GOOGLE_SIMULADO = 'camila.rojas@correounivalle.edu.co'

export default function CompletarPerfil() {
  const navigate = useNavigate()
  const { usuario: sesion, iniciarSesion, cerrarSesion } = useSesion()
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [avatar, setAvatar] = useState<AvatarId>('A')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (cargando) return

    if (!/^[A-Za-z0-9_]{3,20}$/.test(nombreUsuario)) {
      setError(MSG_USUARIO_FORMATO)
      document.getElementById('perfil-usuario')?.focus()
      return
    }

    setError('')
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      if (nombreUsuario.toLowerCase() === USUARIO_SIMULADO_OCUPADO) {
        setError(MSG_USUARIO_OCUPADO)
        document.getElementById('perfil-usuario')?.focus()
        return
      }
      iniciarSesion({
        nombres: sesion?.nombres ?? '',
        usuario: nombreUsuario,
        avatar,
      })
      navigate('/panel')
    }, 1000)
  }

  function cancelar() {
    cerrarSesion()
    navigate('/ingresar')
  }

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">Elige tu nombre de usuario</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Último paso: así te verán tus compañeros en el Salón de Estudio.
        </p>

        <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
          {error ? (
            <Mensaje tipo="error">{MSG_BANNER_ERROR}</Mensaje>
          ) : (
            <div
              role="status"
              className="flex items-start gap-3 rounded-lg border border-primario bg-superficie px-4 py-3 text-sm text-texto"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 shrink-0 text-primario"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Entraste con Google como {CORREO_GOOGLE_SIMULADO}. Necesitas un nombre de usuario
                para continuar.
              </span>
            </div>
          )}

          <Campo
            id="perfil-nombre"
            label="Nombre (de tu cuenta de Google)"
            value={sesion?.nombres ?? ''}
            readOnly
            disabled
          />

          <Campo
            id="perfil-usuario"
            label="Nombre de usuario *"
            placeholder="Ej.: camila_r"
            autoComplete="username"
            ayuda="Entre 3 y 20 caracteres: letras, números y guion bajo. Debe ser único."
            value={nombreUsuario}
            onChange={(e) => {
              setNombreUsuario(e.target.value)
              if (error) setError('')
            }}
            error={error || undefined}
          />

          <SelectorAvatar value={avatar} onChange={setAvatar} />

          <div className="flex flex-col gap-4">
            <Boton type="submit" tipo="primario" className="w-full" disabled={cargando}>
              Guardar y continuar
            </Boton>
            {cargando && <Carga texto="Guardando tu nombre de usuario..." className="justify-center" />}
          </div>
        </form>

        <p className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={cancelar}
            disabled={cargando}
            className="rounded text-primario underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primario-oscuro focus-visible:ring-offset-2"
          >
            Cancelar y volver
          </button>
        </p>
      </div>
    </section>
  )
}
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Boton from '../components/Boton'
import Campo from '../components/Campo'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import { useSesion } from '../context/SesionContexto'

type Errores = { correo?: string; contrasena?: string }

const MSG_CREDENCIALES =
  'Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.'
const MSG_GOOGLE =
  'No se pudo continuar con Google. Puedes intentarlo de nuevo o ingresar con tu correo.'

// Datos simulados (Bloque 3). En el Bloque 4 se reemplazan por la API.
const CORREO_SIMULADO = 'camila.rojas@correounivalle.edu.co'
const CONTRASENA_SIMULADA = 'Estudio123'

export default function Ingresar() {
  const navigate = useNavigate()
  const { iniciarSesion } = useSesion()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [banner, setBanner] = useState('')
  const [cargando, setCargando] = useState(false)
  const [textoCarga, setTextoCarga] = useState('Iniciando sesión...')

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (cargando) return

    const e: Errores = {}
    if (!correo.trim()) e.correo = 'Escribe tu correo.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      e.correo = 'Escribe un correo válido, por ejemplo nombre@correounivalle.edu.co.'
    }
    if (!contrasena) e.contrasena = 'Escribe tu contraseña.'

    setBanner('')
    if (e.correo || e.contrasena) {
      setErrores(e)
      document.getElementById(e.correo ? 'ingresar-correo' : 'ingresar-contrasena')?.focus()
      return
    }

    setErrores({})
    setTextoCarga('Iniciando sesión...')
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      if (correo.trim().toLowerCase() === CORREO_SIMULADO && contrasena === CONTRASENA_SIMULADA) {
        iniciarSesion({ nombres: 'Camila', usuario: 'camila_rojas', avatar: 'A' })
        navigate('/panel')
        return
      }
      setBanner(MSG_CREDENCIALES)
      document.getElementById('ingresar-correo')?.focus()
    }, 1000)
  }

  function continuarConGoogle() {
    if (cargando) return
    setErrores({})
    setBanner('')
    setTextoCarga('Conectando con Google...')
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      setBanner(MSG_GOOGLE)
    }, 1000)
  }

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">Inicia sesión</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Ingresa con tu correo o con tu cuenta de Google.
        </p>

        <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
          {banner && <Mensaje tipo="error">{banner}</Mensaje>}

          <Campo
            id="ingresar-correo"
            type="email"
            label="Correo *"
            placeholder="nombre@correounivalle.edu.co"
            autoComplete="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value)
              if (errores.correo) setErrores((x) => ({ ...x, correo: undefined }))
            }}
            error={errores.correo}
          />

          <Campo
            id="ingresar-contrasena"
            type="password"
            label="Contraseña *"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value)
              if (errores.contrasena) setErrores((x) => ({ ...x, contrasena: undefined }))
            }}
            error={errores.contrasena}
          />

          <div className="flex flex-col gap-4">
            <Boton type="submit" tipo="primario" className="w-full" disabled={cargando}>
              Ingresar
            </Boton>
            {cargando && <Carga texto={textoCarga} className="justify-center" />}

            <div className="flex items-center gap-3 text-sm text-texto-secundario">
              <span className="h-px flex-1 bg-borde" aria-hidden="true" />
              <span>o</span>
              <span className="h-px flex-1 bg-borde" aria-hidden="true" />
            </div>

            <Boton
              type="button"
              tipo="secundario"
              className="w-full"
              disabled={cargando}
              onClick={continuarConGoogle}
            >
              Continuar con Google
            </Boton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-texto-secundario">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-primario hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  )
}
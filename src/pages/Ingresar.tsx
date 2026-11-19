import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import Boton from '../components/Boton'
import Campo from '../components/Campo'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import { useSesion } from '../context/SesionContexto'
import { auth } from '../services/firebase'

type Errores = { correo?: string; contrasena?: string }

const MSG_CREDENCIALES =
  'Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.'
const MSG_GOOGLE =
  'No se pudo continuar con Google. Puedes intentarlo de nuevo o ingresar con tu correo.'
const MSG_MUCHOS_INTENTOS = 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
const MSG_CONEXION =
  'No pudimos iniciar tu sesión. Revisa tu conexión e inténtalo de nuevo.'

const CODIGOS_CREDENCIALES = [
  'auth/invalid-credential',
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-email',
]

function mensajeDeFirebase(error: unknown): string {
  const codigo = (error as { code?: string } | null)?.code ?? ''
  if (CODIGOS_CREDENCIALES.includes(codigo)) return MSG_CREDENCIALES
  if (codigo === 'auth/too-many-requests') return MSG_MUCHOS_INTENTOS
  return MSG_CONEXION
}

export default function Ingresar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { errorSesion } = useSesion()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [banner, setBanner] = useState('')
  const [cargando, setCargando] = useState(false)
  const [textoCarga, setTextoCarga] = useState('Iniciando sesión...')
  const [sesionCerrada, setSesionCerrada] = useState(
    Boolean((location.state as { cerradaSesion?: boolean } | null)?.cerradaSesion),
  )
  const [intentado, setIntentado] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (cargando) return
    setSesionCerrada(false)
    setIntentado(true)

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
    try {
      await signInWithEmailAndPassword(auth, correo.trim(), contrasena)
      navigate('/panel')
    } catch (error) {
      setBanner(mensajeDeFirebase(error))
      document.getElementById('ingresar-correo')?.focus()
    } finally {
      setCargando(false)
    }
  }

  // Temporal hasta la 4.6 (flujo real de Google).
  function continuarConGoogle() {
    if (cargando) return
    setSesionCerrada(false)
    setIntentado(true)
    setErrores({})
    setBanner('')
    setTextoCarga('Conectando con Google...')
    setCargando(true)
    setTimeout(() => {
      setCargando(false)
      setBanner(MSG_GOOGLE)
    }, 1000)
  }

  const bannerVisible = banner || (!intentado ? errorSesion : '')

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">Inicia sesión</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Ingresa con tu correo o con tu cuenta de Google.
        </p>

        <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
          {sesionCerrada && !bannerVisible && (
            <Mensaje tipo="exito">
              Cerraste sesión correctamente. Tus datos privados ya no se muestran.
            </Mensaje>
          )}
          {bannerVisible && <Mensaje tipo="error">{bannerVisible}</Mensaje>}

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
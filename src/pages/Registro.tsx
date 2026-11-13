import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Boton from '../components/Boton'
import Campo from '../components/Campo'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import SelectorAvatar from '../components/SelectorAvatar'
import type { AvatarId } from '../components/SelectorAvatar'

type NombreCampo = 'nombres' | 'apellidos' | 'usuario' | 'correo' | 'contrasena'
type Errores = Partial<Record<NombreCampo, string>>

const ORDEN: NombreCampo[] = ['nombres', 'apellidos', 'usuario', 'correo', 'contrasena']

const MSG_USUARIO_OCUPADO = 'Ese nombre de usuario ya está en uso. Prueba con otro.'
const MSG_CORREO_REGISTRADO =
  'Este correo ya tiene una cuenta. Ingresa con ese correo o usa otro para registrarte.'

// Datos simulados de prueba
const USUARIO_SIMULADO_OCUPADO = 'camila_rojas'
const CORREO_SIMULADO_REGISTRADO = 'camila.rojas@correounivalle.edu.co'

function validar(v: Record<NombreCampo, string>): Errores {
  const e: Errores = {}
  if (!v.nombres.trim()) e.nombres = 'Escribe tus nombres.'
  if (!v.apellidos.trim()) e.apellidos = 'Escribe tus apellidos.'
  if (!/^[A-Za-z0-9_]{3,20}$/.test(v.usuario)) {
    e.usuario = 'Usa entre 3 y 20 caracteres: letras, números o guion bajo.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo.trim())) {
    e.correo = 'Escribe un correo válido, por ejemplo nombre@correounivalle.edu.co.'
  }
  if (v.contrasena.length < 8 || !/[A-Za-z]/.test(v.contrasena) || !/\d/.test(v.contrasena)) {
    e.contrasena = 'La contraseña debe tener mínimo 8 caracteres, una letra y un número.'
  }
  return e
}

function enfocarPrimero(errores: Errores) {
  const primero = ORDEN.find((c) => errores[c])
  if (primero) document.getElementById(`registro-${primero}`)?.focus()
}

export default function Registro() {
  const navigate = useNavigate()
  const [valores, setValores] = useState<Record<NombreCampo, string>>({
    nombres: '',
    apellidos: '',
    usuario: '',
    correo: '',
    contrasena: '',
  })
  const [avatar, setAvatar] = useState<AvatarId>('A')
  const [errores, setErrores] = useState<Errores>({})
  const [cargando, setCargando] = useState(false)

  const hayErrores = Object.keys(errores).length > 0
  const correoYaRegistrado = errores.correo === MSG_CORREO_REGISTRADO

  function cambiar(campo: NombreCampo, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
    if (errores[campo]) {
      setErrores((e) => {
        const copia = { ...e }
        delete copia[campo]
        return copia
      })
    }
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (cargando) return

    const encontrados = validar(valores)
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      enfocarPrimero(encontrados)
      return
    }

    setErrores({})
    setCargando(true)
    setTimeout(() => {
      const servidor: Errores = {}
      if (valores.usuario.toLowerCase() === USUARIO_SIMULADO_OCUPADO) {
        servidor.usuario = MSG_USUARIO_OCUPADO
      }
      if (valores.correo.trim().toLowerCase() === CORREO_SIMULADO_REGISTRADO) {
        servidor.correo = MSG_CORREO_REGISTRADO
      }
      setCargando(false)
      if (Object.keys(servidor).length > 0) {
        setErrores(servidor)
        enfocarPrimero(servidor)
        return
      }
      navigate('/panel')
    }, 1200)
  }

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Completa tus datos para entrar al Salón de Estudio. Los campos con * son obligatorios.
        </p>

        <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
          {hayErrores && (
            <Mensaje tipo="error">
              Revisa los campos marcados para continuar. Todavía no se creó tu cuenta.
            </Mensaje>
          )}

          <Campo
            id="registro-nombres"
            label="Nombres *"
            placeholder="Ej.: Camila Andrea"
            autoComplete="given-name"
            value={valores.nombres}
            onChange={(e) => cambiar('nombres', e.target.value)}
            error={errores.nombres}
          />

          <Campo
            id="registro-apellidos"
            label="Apellidos *"
            placeholder="Ej.: Rojas Pérez"
            autoComplete="family-name"
            value={valores.apellidos}
            onChange={(e) => cambiar('apellidos', e.target.value)}
            error={errores.apellidos}
          />

          <Campo
            id="registro-usuario"
            label="Nombre de usuario *"
            placeholder="Ej.: camila_rojas"
            autoComplete="username"
            ayuda="Entre 3 y 20 caracteres: letras, números y guion bajo. Debe ser único."
            value={valores.usuario}
            onChange={(e) => cambiar('usuario', e.target.value)}
            error={errores.usuario}
          />

          <SelectorAvatar value={avatar} onChange={setAvatar} />

          <div className="flex flex-col gap-2">
            <Campo
              id="registro-correo"
              type="email"
              label="Correo institucional *"
              placeholder="nombre@correounivalle.edu.co"
              autoComplete="email"
              value={valores.correo}
              onChange={(e) => cambiar('correo', e.target.value)}
              error={errores.correo}
            />
            {correoYaRegistrado && (
              <p className="text-center text-sm text-texto-secundario">
                ¿Es tu cuenta?{' '}
                <Link to="/ingresar" className="text-primario underline">
                  Ir a iniciar sesión
                </Link>
              </p>
            )}
          </div>

          <Campo
            id="registro-contrasena"
            type="password"
            label="Contraseña *"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            ayuda="Mínimo 8 caracteres, con una letra y un número."
            value={valores.contrasena}
            onChange={(e) => cambiar('contrasena', e.target.value)}
            error={errores.contrasena}
          />

          <div className="flex flex-col gap-4">
            <Boton type="submit" tipo="primario" className="w-full" disabled={cargando}>
              Crear cuenta
            </Boton>
            {cargando && <Carga texto="Creando tu cuenta..." className="justify-center" />}

            <div className="flex items-center gap-3 text-sm text-texto-secundario">
              <span className="h-px flex-1 bg-borde" aria-hidden="true" />
              <span>o</span>
              <span className="h-px flex-1 bg-borde" aria-hidden="true" />
            </div>

            <Boton type="button" tipo="secundario" className="w-full" disabled={cargando}>
              Continuar con Google
            </Boton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-texto-secundario">
          ¿Ya tienes cuenta?{' '}
          <Link to="/ingresar" className="text-primario hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </section>
  )
}
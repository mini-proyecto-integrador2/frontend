import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton, { BotonEnlace } from '../components/Boton'
import Campo from '../components/Campo'
import Carga from '../components/Carga'
import Mensaje from '../components/Mensaje'
import ModalConfirmar from '../components/ModalConfirmar'
import SelectorAvatar, { AVATARES } from '../components/SelectorAvatar'
import type { AvatarId } from '../components/SelectorAvatar'
import { useSesion } from '../context/SesionContexto'
import { ErrorApi, actualizarMiPerfil, eliminarMiCuenta, obtenerMiPerfil } from '../services/api'

const MSG_USUARIO_FORMATO = 'Usa entre 3 y 20 caracteres: letras, números o guion bajo.'
const MSG_USUARIO_OCUPADO = 'Ese nombre de usuario ya está en uso. Prueba con otro.'
const MSG_CONEXION = 'No pudimos guardar tus cambios. Revisa tu conexión e inténtalo de nuevo.'

function avatarValido(valor: string): AvatarId {
  return (AVATARES.find((a) => a.id === valor)?.id ?? 'A') as AvatarId
}

type Errores = { nombres?: string; apellidos?: string; username?: string }

export default function Perfil() {
  const navigate = useNavigate()
  const { establecerPerfil, cerrarSesion } = useSesion()

  // Carga inicial
  const [cargandoPerfil, setCargandoPerfil] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  // Formulario
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState<AvatarId>('A')
  const [correo, setCorreo] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Eliminar cuenta
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  const cargar = useCallback(async () => {
    setCargandoPerfil(true)
    setErrorCarga('')
    try {
      const p = await obtenerMiPerfil()
      setNombres(p.nombres)
      setApellidos(p.apellidos)
      setUsername(p.username)
      setAvatar(avatarValido(p.avatar))
      setCorreo(p.correo)
    } catch {
      setErrorCarga('No pudimos cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setCargandoPerfil(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  function enfocar(id: string) {
    document.getElementById(id)?.focus()
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando) return
    setGuardado(false)
    setErrorGeneral('')

    const nuevos: Errores = {}
    if (!nombres.trim()) nuevos.nombres = 'Escribe tu nombre.'
    if (!apellidos.trim()) nuevos.apellidos = 'Escribe tus apellidos.'
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) nuevos.username = MSG_USUARIO_FORMATO
    setErrores(nuevos)
    if (nuevos.nombres) return enfocar('perfil-nombres')
    if (nuevos.apellidos) return enfocar('perfil-apellidos')
    if (nuevos.username) return enfocar('perfil-username')

    setGuardando(true)
    try {
      const perfil = await actualizarMiPerfil({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        username,
        avatar,
      })
      establecerPerfil(perfil)
      setGuardado(true)
    } catch (e) {
      const codigo = e instanceof ErrorApi ? e.codigo : undefined
      if (codigo === 'USERNAME_TAKEN') {
        setErrores({ username: MSG_USUARIO_OCUPADO })
        enfocar('perfil-username')
      } else if (codigo === 'VALIDATION_ERROR') {
        setErrorGeneral('Revisa los campos marcados e inténtalo de nuevo.')
      } else {
        setErrorGeneral(MSG_CONEXION)
      }
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminar() {
    if (eliminando) return
    setEliminando(true)
    setErrorEliminar('')
    try {
      await eliminarMiCuenta()
      cerrarSesion()
      navigate('/', { replace: true, state: { cuentaEliminada: true } })
    } catch {
      setConfirmando(false)
      setErrorEliminar('No pudimos eliminar tu cuenta. Tu cuenta sigue activa; inténtalo de nuevo.')
    } finally {
      setEliminando(false)
    }
  }

  if (cargandoPerfil) {
    return (
      <section className="mx-auto w-full max-w-lg px-4 py-10">
        <Carga texto="Cargando tu perfil..." className="justify-center" />
      </section>
    )
  }

  if (errorCarga) {
    return (
      <section className="mx-auto w-full max-w-lg px-4 py-10">
        <div className="flex flex-col gap-4 rounded-xl border border-borde bg-white p-6 sm:p-8">
          <Mensaje tipo="error">{errorCarga}</Mensaje>
          <Boton type="button" onClick={() => void cargar()}>
            Reintentar
          </Boton>
          <BotonEnlace to="/panel" tipo="secundario">
            Volver al panel
          </BotonEnlace>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">Mi perfil</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Estos son los datos que ven tus compañeros en el Salón de Estudio.
        </p>

        <form onSubmit={guardar} noValidate className="mt-6 flex flex-col gap-5">
          {/* Región viva: el lector de pantalla anuncia "Cambios guardados" sin mover el foco */}
          <div role="status" aria-live="polite">
            {guardado && <Mensaje tipo="exito">Cambios guardados.</Mensaje>}
          </div>
          {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

          <Campo
            id="perfil-nombres"
            label="Nombres *"
            autoComplete="given-name"
            value={nombres}
            onChange={(e) => {
              setNombres(e.target.value)
              setGuardado(false)
            }}
            error={errores.nombres}
          />
          <Campo
            id="perfil-apellidos"
            label="Apellidos *"
            autoComplete="family-name"
            value={apellidos}
            onChange={(e) => {
              setApellidos(e.target.value)
              setGuardado(false)
            }}
            error={errores.apellidos}
          />
          <Campo
            id="perfil-username"
            label="Nombre de usuario *"
            autoComplete="username"
            ayuda="Entre 3 y 20 caracteres: letras, números y guion bajo. Debe ser único."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setGuardado(false)
              if (errores.username) setErrores((x) => ({ ...x, username: undefined }))
            }}
            error={errores.username}
          />
          <Campo
            id="perfil-correo"
            label="Correo"
            value={correo}
            readOnly
            disabled
            ayuda="El correo no se puede cambiar."
          />

          <SelectorAvatar
            value={avatar}
            onChange={(a) => {
              setAvatar(a)
              setGuardado(false)
            }}
          />

          <div className="flex flex-col gap-4">
            <Boton type="submit" tipo="primario" className="w-full" disabled={guardando}>
              Guardar cambios
            </Boton>
            {guardando && <Carga texto="Guardando tus cambios..." className="justify-center" />}
            <BotonEnlace to="/panel" tipo="secundario" className="w-full">
              Volver al panel
            </BotonEnlace>
          </div>
        </form>
      </div>

      {/* Zona de peligro: el rojo se usa solo para acciones destructivas */}
      <div className="mt-6 rounded-xl border border-error bg-error-fondo p-6 sm:p-8">
        <h2 className="text-xl font-bold text-error">Eliminar cuenta</h2>
        <p className="mt-2 text-sm text-texto">
          Si eliminas tu cuenta se borran tu perfil y tu nombre de usuario. Esta acción no se puede
          deshacer.
        </p>
        {errorEliminar && (
          <div className="mt-4">
            <Mensaje tipo="error">{errorEliminar}</Mensaje>
          </div>
        )}
        <Boton type="button" tipo="peligro" className="mt-4 w-full sm:w-auto" onClick={() => setConfirmando(true)}>
          Eliminar mi cuenta
        </Boton>
      </div>

      {confirmando && (
        <ModalConfirmar
          titulo="¿Eliminar tu cuenta?"
          textoConfirmar="Sí, eliminar mi cuenta"
          textoCargando="Eliminando..."
          cargando={eliminando}
          onConfirmar={() => void confirmarEliminar()}
          onCancelar={() => setConfirmando(false)}
        >
          <p>Esto es lo que va a pasar:</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Se borra tu perfil y tu nombre de usuario.</li>
            <li>Se cierra tu sesión y vuelves al inicio.</li>
            <li>No podrás recuperar tu cuenta.</li>
          </ul>
        </ModalConfirmar>
      )}
    </section>
  )
}

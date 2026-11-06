import { BotonEnlace } from '../components/Boton'

const funciones = [
  {
    titulo: 'Chat en tiempo real',
    texto: 'Habla con tu grupo y recupera el historial cuando vuelvas a la sala.',
    icono: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  {
    titulo: 'Audio y video',
    texto: 'Mírense y escúchense mientras resuelven ejercicios juntos.',
    icono: (
      <>
        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
      </>
    ),
  },
  {
    titulo: 'Compartir pantalla',
    texto: 'Presenta tus apuntes o tu código a todos los de la sala.',
    icono: (
      <>
        <path d="m9 10 3-3 3 3" />
        <path d="M12 13V7" />
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="M12 17v4" />
        <path d="M8 21h8" />
      </>
    ),
  },
]

export default function Inicio() {
  return (
    <div className="flex flex-col gap-10 px-4 py-8 md:gap-18 md:px-16 md:py-22">
      <section className="flex flex-col items-center gap-8 md:flex-row md:gap-16">
        <div className="flex flex-1 flex-col gap-5">
          <span className="w-fit rounded-full bg-superficie px-3 py-1 text-sm text-acento">Para estudiantes que estudian en grupo</span>
          <h1 className="text-3xl font-semibold leading-tight md:text-5xl">Tu salón de estudio, en línea y en tiempo real</h1>
          <p className="text-texto-secundario">
            Crea una sala, comparte el ID con tu grupo y estudien juntos con chat, audio, video y pantalla compartida. Sin instalar nada.
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <BotonEnlace to="/registro">Crear cuenta gratis</BotonEnlace>
            <BotonEnlace to="/ingresar" tipo="secundario">Ya tengo cuenta</BotonEnlace>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-superficie p-6 md:w-[520px]">
          <article className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-borde bg-fondo p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-medium">Cálculo multivariado</h2>
              <span className="rounded-full bg-acento px-2 py-0.5 text-sm text-white">Anfitrión</span>
            </div>
            <p className="text-sm text-texto-secundario">ID de sala: MAT-4821</p>
            <p className="text-sm">3 participantes conectados</p>
          </article>
          <p className="text-sm text-texto-secundario">Así se ve una sala en tu Panel</p>
        </div>
      </section>

      <section aria-labelledby="titulo-funciones" className="flex flex-col gap-6">
        <h2 id="titulo-funciones" className="text-2xl font-semibold">Todo lo que tu grupo necesita</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {funciones.map((f) => (
            <li key={f.titulo} className="flex flex-col gap-3 rounded-xl border border-superficie p-6">
              <span className="flex size-12 items-center justify-center rounded-xl bg-superficie">
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {f.icono}
                </svg>
              </span>
              <h3 className="text-xl font-medium">{f.titulo}</h3>
              <p className="text-texto-secundario">{f.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

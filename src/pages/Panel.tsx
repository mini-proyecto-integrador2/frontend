import { useSesion } from '../context/SesionContexto'

export default function Panel() {
  const { usuario } = useSesion()
  const primerNombre = usuario?.nombres.trim().split(' ')[0] ?? ''

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="rounded-xl border border-borde bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-texto sm:text-3xl">
          {primerNombre ? `Hola, ${primerNombre}` : 'Hola'}
        </h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Este es tu panel. Desde aquí vas a entrar a tus salones de estudio.
        </p>

        <div className="mt-6 rounded-xl border border-borde bg-superficie px-6 py-10 text-center">
          <p className="font-bold text-texto">Aún no tienes salones de estudio.</p>
          <p className="mt-1 text-sm text-texto-secundario">
            Cuando crees o te unas a un salón, aparecerá aquí.
          </p>
        </div>
      </div>
    </section>
  )
}
import { BotonEnlace } from '../components/Boton'

export default function NoEncontrada() {
  return (
    <div className="flex flex-col items-start gap-5 px-4 py-12 md:px-16 md:py-24">
      <p className="font-titulo text-6xl font-semibold text-primario">404</p>
      <h1 className="text-3xl font-semibold">No encontramos esta página</h1>
      <p className="max-w-xl text-texto-secundario">
        Puede que el enlace esté mal escrito o que la página ya no exista. Si buscabas una sala, pide de nuevo su ID a tu grupo.
      </p>
      <BotonEnlace to="/">Volver al inicio</BotonEnlace>
    </div>
  )
}

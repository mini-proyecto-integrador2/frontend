import { BotonEnlace } from '../components/Boton'

// Pantalla vacía para las rutas del mapa del sitio que llegan en sprints siguientes.
export default function EnConstruccion({ titulo, sprint }: { titulo: string; sprint: number }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-8 md:px-16 md:py-16">
      <h1 className="text-3xl font-semibold">{titulo}</h1>
      <p className="text-texto-secundario">Esta pantalla se construye en el Sprint {sprint}.</p>
      <BotonEnlace to="/" tipo="secundario" className="w-fit">Volver al inicio</BotonEnlace>
    </div>
  )
}

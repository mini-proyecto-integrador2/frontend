import type { Autor } from '../../services/tiempoReal'

type Props = { participantes: Autor[]; anfitrionUid: string; miUid?: string }

// Zona de participantes conectados (se actualiza con el evento sala:presencia).
export default function Participantes({ participantes, anfitrionUid, miUid }: Props) {
  return (
    <aside aria-labelledby="titulo-participantes" className="flex flex-col gap-3 rounded-xl border border-borde bg-white p-4 sm:p-5">
      <h2 id="titulo-participantes" className="text-lg font-semibold text-texto">
        Participantes ({participantes.length})
      </h2>
      {participantes.length === 0 ? (
        <p className="text-sm text-texto-secundario">Nadie más está conectado en este momento.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {participantes.map((p) => (
            <li key={p.uid} className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-acento text-sm font-semibold text-white">
                {p.username.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 truncate text-texto">
                {p.username}
                {p.uid === miUid && <span className="text-texto-secundario"> (tú)</span>}
              </span>
              {p.uid === anfitrionUid && (
                <span className="rounded-full bg-exito-fondo px-2 py-0.5 text-xs font-medium text-exito">Anfitrión</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

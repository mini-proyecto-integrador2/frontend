import { useId } from 'react'

export const AVATARES = [
  { id: 'A', nombre: 'A', color: '#BFDBFE' },
  { id: 'B', nombre: 'B', color: '#FDE68A' },
  { id: 'C', nombre: 'C', color: '#BBF7D0' },
  { id: 'D', nombre: 'D', color: '#FBCFE8' },
] as const

export type AvatarId = (typeof AVATARES)[number]['id']

type Props = {
  value: AvatarId
  onChange: (id: AvatarId) => void
  label?: string
  ayuda?: string
}

export default function SelectorAvatar({
  value,
  onChange,
  label = 'Avatar',
  ayuda = 'Elige la imagen que verán tus compañeros',
}: Props) {
  const nombreGrupo = useId()
  const idAyuda = `${nombreGrupo}-ayuda`

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={idAyuda}
    >
      <legend className="mb-1 font-medium text-texto">{label}</legend>

      <div className="flex flex-wrap gap-4">
        {AVATARES.map((avatar) => (
          <label key={avatar.id} className="relative cursor-pointer">
            <input
              type="radio"
              name={nombreGrupo}
              value={avatar.id}
              checked={value === avatar.id}
              onChange={() => onChange(avatar.id)}
              className="peer sr-only"
            />
            <span
              style={{ backgroundColor: avatar.color }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-transparent font-titulo text-xl font-semibold text-black peer-checked:border-primario peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primario-oscuro"
            >
              <span aria-hidden="true">{avatar.nombre}</span>
              <span className="sr-only">Avatar {avatar.nombre}</span>
            </span>
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-primario text-white shadow peer-checked:flex"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </span>
          </label>
        ))}
      </div>

      <p id={idAyuda} className="text-sm text-texto-secundario">
        {ayuda}
      </p>
    </fieldset>
  )
}
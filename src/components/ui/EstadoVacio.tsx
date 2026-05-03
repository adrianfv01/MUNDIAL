import type { ReactNode } from 'react'

interface EstadoVacioProps {
  icono?: ReactNode
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ icono, titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      {icono && (
        <div className="mb-4 rounded-full p-4 bg-trofeo-300/10 borde-trofeo text-trofeo-200">
          {icono}
        </div>
      )}
      <h3 className="titulo-display text-xl text-crema">{titulo}</h3>
      {descripcion && (
        <p className="mt-2 text-sm text-crema/60 max-w-xs">{descripcion}</p>
      )}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}

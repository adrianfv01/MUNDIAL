import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Estampa } from '@/lib/types'

interface MiniStickerProps {
  estampa: Estampa
  bandera?: string
  colorPrimario?: string
  colorSecundario?: string
  acento?: 'campo' | 'trofeo'
  className?: string
}

export function MiniSticker({
  estampa,
  bandera,
  colorPrimario,
  colorSecundario,
  acento = 'trofeo',
  className,
}: MiniStickerProps) {
  const esEspecial = estampa.tipo === 'especial' || estampa.foil
  const [imagenError, setImagenError] = useState(false)
  const tieneFoto = Boolean(estampa.imagen) && !imagenError

  const fondo = colorPrimario
    ? `linear-gradient(135deg, ${colorPrimario}cc, ${colorSecundario ?? colorPrimario}cc)`
    : undefined

  const aro =
    acento === 'campo'
      ? 'border-campo-300/40 shadow-[0_0_0_1px_rgba(86,188,121,0.18)]'
      : 'border-trofeo-300/40 shadow-[0_0_0_1px_rgba(242,193,78,0.18)]'

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border bg-white/5 backdrop-blur-sm p-1.5 pr-2.5',
        aro,
        className,
      )}
      title={`#${estampa.numero} ${estampa.nombre}`}
    >
      <div
        className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden flex items-center justify-center border border-white/15"
        style={fondo ? { background: fondo } : { background: 'rgba(255,255,255,0.04)' }}
      >
        {tieneFoto ? (
          <img
            src={estampa.imagen}
            alt={estampa.nombre}
            onError={() => setImagenError(true)}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : bandera && estampa.tipo !== 'especial' ? (
          <img
            src={`https://flagcdn.com/${bandera.toLowerCase()}.svg`}
            alt=""
            className="h-6 w-6 rounded-full object-cover border border-white/30"
            loading="lazy"
            decoding="async"
          />
        ) : esEspecial ? (
          <Star className="h-5 w-5 text-trofeo-200" fill="currentColor" />
        ) : (
          <span className="titulo-display text-sm text-white/90">#{estampa.numero}</span>
        )}
        {esEspecial && (
          <span
            aria-hidden
            className="absolute inset-0 bg-foil-gradient opacity-30 mix-blend-screen pointer-events-none"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="titulo-display text-[13px] leading-tight text-crema/95 truncate">
          #{estampa.numero}
          <span className="ml-1.5 normal-case tracking-normal font-sans font-semibold text-[11px] text-crema/70">
            {estampa.nombre}
          </span>
        </p>
        {estampa.posicion && (
          <p className="text-[9px] uppercase tracking-wider text-crema/45">
            {estampa.posicion}
          </p>
        )}
      </div>
    </div>
  )
}

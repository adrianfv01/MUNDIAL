import { motion } from 'framer-motion'
import { Star, Plus, Minus, Check } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Estampa } from '@/lib/types'

interface StickerCardProps {
  estampa: Estampa
  cantidad: number
  colorEquipo?: string
  colorSecundario?: string
  bandera?: string
  onIncrementar?: () => void
  onDecrementar?: () => void
  soloLectura?: boolean
}

export function StickerCard({
  estampa,
  cantidad,
  colorEquipo,
  colorSecundario,
  bandera,
  onIncrementar,
  onDecrementar,
  soloLectura,
}: StickerCardProps) {
  const tienes = cantidad > 0
  const repetidas = cantidad > 1
  const esEspecial = estampa.tipo === 'especial' || estampa.foil

  const timerRef = useRef<number | null>(null)

  const onPointerDown = () => {
    if (soloLectura || !onDecrementar || !tienes) return
    timerRef.current = window.setTimeout(() => {
      onDecrementar()
      timerRef.current = null
    }, 550)
  }
  const cancelarLong = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }
  const onClick = () => {
    if (soloLectura || !onIncrementar) return
    if (timerRef.current === null) {
      // El long-press ya disparo decrementar
      onIncrementar()
    }
  }

  const fondoBase = colorEquipo
    ? `linear-gradient(135deg, ${colorEquipo}cc, ${colorSecundario ?? colorEquipo}cc)`
    : 'linear-gradient(135deg, #0E7C3A, #042612)'

  return (
    <motion.button
      type="button"
      whileTap={!soloLectura ? { scale: 0.96 } : undefined}
      onPointerDown={onPointerDown}
      onPointerUp={() => {
        cancelarLong()
        onClick()
      }}
      onPointerLeave={cancelarLong}
      onPointerCancel={cancelarLong}
      onContextMenu={(e) => e.preventDefault()}
      disabled={soloLectura}
      className={cn(
        'group relative overflow-hidden rounded-xl border text-left tap-target transition aspect-[3/4] flex flex-col',
        tienes
          ? 'border-trofeo-300/60 shadow-estampa'
          : 'border-white/10 bg-white/5 opacity-70 hover:opacity-100',
        esEspecial && tienes && 'shadow-foil',
        soloLectura && 'cursor-default',
      )}
      style={tienes ? { background: fondoBase } : undefined}
      aria-label={`${estampa.nombre} ${tienes ? `(tienes ${cantidad})` : '(falta)'}`}
    >
      {esEspecial && tienes && (
        <span
          aria-hidden
          className="absolute inset-0 bg-foil-gradient opacity-25 mix-blend-screen pointer-events-none"
          style={{ backgroundSize: '200% 200%' }}
        />
      )}

      {tienes ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          {bandera && estampa.tipo !== 'especial' && (
            <img
              src={`https://flagcdn.com/${bandera.toLowerCase()}.svg`}
              alt=""
              className="h-12 w-12 rounded-full object-cover border-2 border-white/40 shadow-lg mb-2"
            />
          )}
          {estampa.tipo === 'especial' && (
            <Star className="h-10 w-10 text-trofeo-200 drop-shadow mb-2" fill="currentColor" />
          )}
          <span className="titulo-display text-2xl text-white drop-shadow">
            #{estampa.numero}
          </span>
          {estampa.posicion && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/80 mt-0.5">
              {estampa.posicion}
            </span>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-crema/40">
          <span className="titulo-display text-3xl">#{estampa.numero}</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">Falta</span>
        </div>
      )}

      <div className="relative mt-auto z-10 px-2 py-1.5 bg-carbon/70 backdrop-blur-sm border-t border-white/10">
        <p className="text-[10px] font-semibold text-crema/90 truncate uppercase tracking-wider">
          {estampa.nombre}
        </p>
      </div>

      {tienes && (
        <span className="absolute top-1.5 left-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-campo-500 text-white shadow border border-white/30">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}

      {repetidas && (
        <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-trofeo-300 text-carbon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow border border-white/30">
          x{cantidad}
        </span>
      )}

      {!soloLectura && (
        <div className="absolute inset-x-0 bottom-0 z-20 hidden group-hover:flex justify-between p-1.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur text-white">
            <Minus className="h-3 w-3" />
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-trofeo-300 text-carbon">
            <Plus className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
      )}
    </motion.button>
  )
}

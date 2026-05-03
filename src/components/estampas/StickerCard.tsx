import { AnimatePresence, motion } from 'framer-motion'
import { Star, Plus, Minus, Check } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react'
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
  destacar?: boolean
}

interface FlotanteFeedback {
  id: number
  delta: 1 | -1
}

function vibrar(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate?.(ms)
    } catch {
      /* algunos navegadores requieren gesto previo, ignorar */
    }
  }
}

export const StickerCard = forwardRef<HTMLDivElement, StickerCardProps>(function StickerCard(
  {
    estampa,
    cantidad,
    colorEquipo,
    colorSecundario,
    bandera,
    onIncrementar,
    onDecrementar,
    soloLectura,
    destacar,
  },
  ref,
) {
  const tienes = cantidad > 0
  const repetidas = cantidad > 1
  const esEspecial = estampa.tipo === 'especial' || estampa.foil

  const [flotantes, setFlotantes] = useState<FlotanteFeedback[]>([])
  const idRef = useRef(0)
  const repeatTimerRef = useRef<number | null>(null)
  const repeatIntervalRef = useRef<number | null>(null)

  const empujarFeedback = useCallback((delta: 1 | -1) => {
    const id = ++idRef.current
    setFlotantes((prev) => [...prev, { id, delta }])
    window.setTimeout(() => {
      setFlotantes((prev) => prev.filter((f) => f.id !== id))
    }, 650)
  }, [])

  const sumar = useCallback(() => {
    if (soloLectura || !onIncrementar) return
    onIncrementar()
    empujarFeedback(1)
    vibrar(8)
  }, [empujarFeedback, onIncrementar, soloLectura])

  const restar = useCallback(() => {
    if (soloLectura || !onDecrementar || cantidad <= 0) return
    onDecrementar()
    empujarFeedback(-1)
    vibrar(12)
  }, [cantidad, empujarFeedback, onDecrementar, soloLectura])

  // Mantener presionado un botón del stepper repite la acción (auto-repeat).
  const detenerRepeticion = useCallback(() => {
    if (repeatTimerRef.current) {
      window.clearTimeout(repeatTimerRef.current)
      repeatTimerRef.current = null
    }
    if (repeatIntervalRef.current) {
      window.clearInterval(repeatIntervalRef.current)
      repeatIntervalRef.current = null
    }
  }, [])

  const iniciarRepeticion = useCallback(
    (accion: () => void) => {
      detenerRepeticion()
      repeatTimerRef.current = window.setTimeout(() => {
        repeatIntervalRef.current = window.setInterval(accion, 90)
      }, 380)
    },
    [detenerRepeticion],
  )

  const handleStepperPointerDown = useCallback(
    (accion: () => void) => (e: PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      iniciarRepeticion(accion)
    },
    [iniciarRepeticion],
  )

  const fondoBase = colorEquipo
    ? `linear-gradient(135deg, ${colorEquipo}cc, ${colorSecundario ?? colorEquipo}cc)`
    : 'linear-gradient(135deg, #0E7C3A, #042612)'

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    // Evita reaccionar a clics que vienen del stepper interno.
    const target = e.target as HTMLElement
    if (target.closest('[data-stepper="true"]')) return
    sumar()
  }

  return (
    <motion.div
      ref={ref}
      whileTap={!soloLectura ? { scale: 0.97 } : undefined}
      animate={
        destacar
          ? {
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 0 0 rgba(242, 193, 78, 0)',
                '0 0 0 6px rgba(242, 193, 78, 0.55)',
                '0 0 0 0 rgba(242, 193, 78, 0)',
              ],
            }
          : undefined
      }
      transition={destacar ? { duration: 1.6, repeat: 1, ease: 'easeInOut' } : undefined}
      onClick={soloLectura ? undefined : handleCardClick}
      onContextMenu={(e) => e.preventDefault()}
      role={soloLectura ? undefined : 'button'}
      tabIndex={soloLectura ? -1 : 0}
      onKeyDown={(e) => {
        if (soloLectura) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          sumar()
        } else if (e.key === '-' || e.key === 'Backspace') {
          e.preventDefault()
          restar()
        }
      }}
      className={cn(
        'group relative overflow-hidden rounded-xl border text-left tap-target transition aspect-[3/4] flex flex-col select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-trofeo-300/70',
        tienes
          ? 'border-trofeo-300/60 shadow-estampa cursor-pointer'
          : 'border-white/10 bg-white/5 opacity-75 hover:opacity-100 cursor-pointer',
        esEspecial && tienes && 'shadow-foil',
        soloLectura && 'cursor-default',
        destacar && 'ring-4 ring-trofeo-300 ring-offset-2 ring-offset-carbon',
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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-none">
          {bandera && estampa.tipo !== 'especial' && (
            <img
              src={`https://flagcdn.com/${bandera.toLowerCase()}.svg`}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-crema/40 pointer-events-none">
          <span className="titulo-display text-3xl">#{estampa.numero}</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">Falta</span>
          {!soloLectura && (
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-trofeo-300/90 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition">
              <Plus className="h-3 w-3" strokeWidth={3} />
              Agregar
            </span>
          )}
        </div>
      )}

      <div className="relative mt-auto z-10 px-2 py-1.5 bg-carbon/70 backdrop-blur-sm border-t border-white/10 pointer-events-none">
        <p className="text-[10px] font-semibold text-crema/90 truncate uppercase tracking-wider">
          {estampa.nombre}
        </p>
      </div>

      {tienes && (
        <span className="absolute top-1.5 left-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-campo-500 text-white shadow border border-white/30 pointer-events-none">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}

      {repetidas && (
        <motion.span
          key={cantidad}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-trofeo-300 text-carbon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow border border-white/30 pointer-events-none"
        >
          x{cantidad}
        </motion.span>
      )}

      {!soloLectura && tienes && (
        <div
          data-stepper="true"
          className="absolute inset-x-0 bottom-0 z-20 flex items-stretch justify-between gap-1 p-1.5 bg-gradient-to-t from-carbon/85 via-carbon/55 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity"
        >
          <button
            type="button"
            data-stepper="true"
            onPointerDown={handleStepperPointerDown(restar)}
            onPointerUp={(e) => {
              e.stopPropagation()
              detenerRepeticion()
            }}
            onPointerLeave={detenerRepeticion}
            onPointerCancel={detenerRepeticion}
            onClick={(e) => {
              e.stopPropagation()
              restar()
            }}
            disabled={cantidad <= 0}
            aria-label={`Restar una de ${estampa.nombre}`}
            className={cn(
              'tap-target inline-flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full',
              'bg-carbon/85 border border-white/25 text-crema shadow',
              'active:scale-90 active:bg-rojo/80 transition-transform',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Minus className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
          </button>
          <button
            type="button"
            data-stepper="true"
            onPointerDown={handleStepperPointerDown(sumar)}
            onPointerUp={(e) => {
              e.stopPropagation()
              detenerRepeticion()
            }}
            onPointerLeave={detenerRepeticion}
            onPointerCancel={detenerRepeticion}
            onClick={(e) => {
              e.stopPropagation()
              sumar()
            }}
            aria-label={`Sumar una de ${estampa.nombre}`}
            className={cn(
              'tap-target inline-flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full',
              'bg-trofeo-300 text-carbon border border-white/40 shadow',
              'active:scale-90 active:bg-trofeo-400 transition-transform',
            )}
          >
            <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {flotantes.map((f) => (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -42 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none',
              'titulo-display text-2xl drop-shadow',
              f.delta === 1 ? 'text-trofeo-200' : 'text-rojo',
            )}
          >
            {f.delta === 1 ? '+1' : '-1'}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  )
})

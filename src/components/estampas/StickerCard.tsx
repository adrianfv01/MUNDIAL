import { AnimatePresence, motion } from 'framer-motion'
import { Star, Plus, Minus, Check, RotateCcw } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import { cn } from '@/lib/utils'
import { useTapNoScroll } from '@/lib/useTapNoScroll'
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

interface AccionReciente {
  delta: 1 | -1
  cantidadNueva: number
  expiraEn: number
}

const VENTANA_DESHACER_MS = 4000

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
  const [accionReciente, setAccionReciente] = useState<AccionReciente | null>(null)
  const idRef = useRef(0)
  const repeatTimerRef = useRef<number | null>(null)
  const repeatIntervalRef = useRef<number | null>(null)
  const deshacerTimerRef = useRef<number | null>(null)

  const empujarFeedback = useCallback((delta: 1 | -1) => {
    const id = ++idRef.current
    setFlotantes((prev) => [...prev, { id, delta }])
    window.setTimeout(() => {
      setFlotantes((prev) => prev.filter((f) => f.id !== id))
    }, 650)
  }, [])

  const programarOcultarDeshacer = useCallback(() => {
    if (deshacerTimerRef.current) {
      window.clearTimeout(deshacerTimerRef.current)
    }
    deshacerTimerRef.current = window.setTimeout(() => {
      setAccionReciente(null)
      deshacerTimerRef.current = null
    }, VENTANA_DESHACER_MS)
  }, [])

  const sumar = useCallback(() => {
    if (soloLectura || !onIncrementar) return
    onIncrementar()
    empujarFeedback(1)
    vibrar(8)
    setAccionReciente({
      delta: 1,
      cantidadNueva: cantidad + 1,
      expiraEn: Date.now() + VENTANA_DESHACER_MS,
    })
    programarOcultarDeshacer()
  }, [cantidad, empujarFeedback, onIncrementar, programarOcultarDeshacer, soloLectura])

  const restar = useCallback(() => {
    if (soloLectura || !onDecrementar || cantidad <= 0) return
    onDecrementar()
    empujarFeedback(-1)
    vibrar(12)
    setAccionReciente({
      delta: -1,
      cantidadNueva: cantidad - 1,
      expiraEn: Date.now() + VENTANA_DESHACER_MS,
    })
    programarOcultarDeshacer()
  }, [cantidad, empujarFeedback, onDecrementar, programarOcultarDeshacer, soloLectura])

  const deshacer = useCallback(() => {
    if (!accionReciente) return
    if (accionReciente.delta === 1 && onDecrementar) {
      onDecrementar()
      empujarFeedback(-1)
    } else if (accionReciente.delta === -1 && onIncrementar) {
      onIncrementar()
      empujarFeedback(1)
    }
    vibrar(20)
    setAccionReciente(null)
    if (deshacerTimerRef.current) {
      window.clearTimeout(deshacerTimerRef.current)
      deshacerTimerRef.current = null
    }
  }, [accionReciente, empujarFeedback, onDecrementar, onIncrementar])

  // Mantener presionado un boton del stepper repite la accion (auto-repeat).
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

  useEffect(() => {
    return () => {
      if (deshacerTimerRef.current) window.clearTimeout(deshacerTimerRef.current)
      if (repeatTimerRef.current) window.clearTimeout(repeatTimerRef.current)
      if (repeatIntervalRef.current) window.clearInterval(repeatIntervalRef.current)
    }
  }, [])

  const fondoBase = colorEquipo
    ? `linear-gradient(135deg, ${colorEquipo}cc, ${colorSecundario ?? colorEquipo}cc)`
    : 'linear-gradient(135deg, #0E7C3A, #042612)'

  // Tap en la tarjeta:
  //  - Si NO tienes la estampa, suma 1 (caso seguro: la marca como "tengo").
  //  - Si ya la tienes, ignoramos el tap para evitar +1 por accidente al hacer
  //    scroll. En ese caso solo los botones - / + ajustan la cantidad.
  //  - Usamos useTapNoScroll: cancela el "tap" si el dedo se movio mas de 10px
  //    o duro mas de 500ms, asi un scroll por encima de la tarjeta no la marca.
  const tapEnTarjetaSuma = !tienes
  const onTap = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (soloLectura || !tapEnTarjetaSuma) return
      const target = e.target as HTMLElement
      if (target.closest('[data-stepper="true"]')) return
      if (target.closest('[data-deshacer="true"]')) return
      sumar()
    },
    [soloLectura, tapEnTarjetaSuma, sumar],
  )
  const tapHandlers = useTapNoScroll<HTMLDivElement>(onTap)

  const interactivo = !soloLectura && (tapEnTarjetaSuma || tienes)
  const mostrarDeshacer = !soloLectura && accionReciente !== null

  return (
    <motion.div
      ref={ref}
      whileTap={tapEnTarjetaSuma ? { scale: 0.97 } : undefined}
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
      onPointerDown={soloLectura || !tapEnTarjetaSuma ? undefined : tapHandlers.onPointerDown}
      onPointerUp={soloLectura || !tapEnTarjetaSuma ? undefined : tapHandlers.onPointerUp}
      onPointerCancel={soloLectura || !tapEnTarjetaSuma ? undefined : tapHandlers.onPointerCancel}
      onPointerLeave={soloLectura || !tapEnTarjetaSuma ? undefined : tapHandlers.onPointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      role={tapEnTarjetaSuma ? 'button' : undefined}
      tabIndex={interactivo ? 0 : -1}
      onKeyDown={(e) => {
        if (soloLectura) return
        if ((e.key === 'Enter' || e.key === ' ') && tapEnTarjetaSuma) {
          e.preventDefault()
          sumar()
        } else if (e.key === '+' && tienes) {
          e.preventDefault()
          sumar()
        } else if ((e.key === '-' || e.key === 'Backspace') && tienes) {
          e.preventDefault()
          restar()
        }
      }}
      className={cn(
        // `isolate` crea un contexto de apilamiento propio para que los z-30
        // internos (stepper, contador, +/-1) NO escapen al documento y se
        // dibujen por encima de overlays como el panel de busqueda o el menu
        // inferior.
        'group relative isolate overflow-hidden rounded-xl border text-left tap-target transition aspect-[3/4] flex flex-col select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-trofeo-300/70',
        tienes
          ? 'border-trofeo-300/60 shadow-estampa'
          : 'border-white/10 bg-white/5 opacity-75 hover:opacity-100',
        tapEnTarjetaSuma && 'cursor-pointer',
        !tapEnTarjetaSuma && tienes && !soloLectura && 'cursor-default',
        esEspecial && tienes && 'shadow-foil',
        soloLectura && 'cursor-default',
        destacar && 'ring-4 ring-trofeo-300 ring-offset-2 ring-offset-carbon',
      )}
      style={tienes ? { background: fondoBase } : undefined}
      aria-label={`${estampa.nombre} ${tienes ? `(tienes ${cantidad})` : '(falta)'}`}
    >
      {esEspecial && tienes && <span aria-hidden className="foil-border z-10" />}

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

      <div className="relative mt-auto z-10 px-2 py-1.5 bg-carbon/75 backdrop-blur-sm border-t border-white/10 pointer-events-none">
        <p className="text-[10px] font-semibold text-crema/95 uppercase tracking-wider leading-tight line-clamp-2 break-words">
          {estampa.nombre}
        </p>
      </div>

      {/* Indicador "ya la tienes" para modo solo lectura. En modo editable la
          pildora del stepper de la esquina opuesta (con su contador) ya
          comunica que la tienes, por lo que se omite para no abarrotar la UI
          en tarjetas pequenas. */}
      {tienes && soloLectura && (
        <span className="absolute top-1.5 left-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-campo-500 text-white shadow border border-white/30 pointer-events-none z-10">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}

      {/* Esquina superior derecha en modo solo lectura: indicador estatico de
          cantidad (cuando hay repetidas). En modo editable la pildora del
          stepper de mas abajo asume esta posicion y muestra el contador. */}
      {repetidas && soloLectura && (
        <motion.span
          key={cantidad}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-trofeo-300 text-carbon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow border border-white/30 pointer-events-none z-10"
        >
          x{cantidad}
        </motion.span>
      )}

      {/* Contador grande momentaneo: confirma visualmente cuantas tienes ahora. */}
      <AnimatePresence>
        {accionReciente && (
          <motion.div
            key={`big-${accionReciente.expiraEn}-${accionReciente.cantidadNueva}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  'titulo-display text-5xl drop-shadow-lg',
                  accionReciente.cantidadNueva === 0
                    ? 'text-rojo'
                    : accionReciente.cantidadNueva > 1
                      ? 'text-trofeo-200'
                      : 'text-white',
                )}
              >
                {accionReciente.cantidadNueva > 0 ? `x${accionReciente.cantidadNueva}` : '0'}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/80 bg-carbon/70 px-2 py-0.5 rounded-full">
                {accionReciente.cantidadNueva === 0
                  ? 'Marcada como falta'
                  : accionReciente.cantidadNueva === 1
                    ? '¡La tienes!'
                    : `Tienes ${accionReciente.cantidadNueva}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pildora de acciones en esquina superior derecha. Combina los botones
          - / + con el contador (cuando hay repetidas), libera el centro de la
          tarjeta y no tapa la franja del nombre en la parte de abajo. Cuando
          hay un cambio reciente, la misma pildora se transforma en boton
          "Deshacer" durante unos segundos. */}
      {!soloLectura && (mostrarDeshacer || tienes) && (
        <div
          className="absolute top-1.5 right-1.5 z-30"
          data-stepper={mostrarDeshacer ? undefined : 'true'}
        >
          {mostrarDeshacer ? (
            <button
              type="button"
              data-deshacer="true"
              onClick={(e) => {
                e.stopPropagation()
                deshacer()
              }}
              aria-label="Deshacer el ultimo cambio"
              className={cn(
                'tap-target inline-flex items-center gap-1 rounded-full',
                'bg-trofeo-300 text-carbon border border-white/40 shadow',
                'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                'active:scale-95 transition-transform',
              )}
            >
              <RotateCcw className="h-3 w-3" strokeWidth={3} />
              Deshacer
            </button>
          ) : (
            <div
              className={cn(
                'inline-flex items-center rounded-full',
                'bg-carbon/90 backdrop-blur-sm border border-white/25 shadow-md',
                'p-0.5 gap-0.5',
              )}
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
                  'tap-target inline-flex h-7 w-7 items-center justify-center rounded-full',
                  'bg-white/10 text-crema',
                  'active:scale-90 active:bg-rojo/80 transition-transform',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
              {repetidas && (
                <motion.span
                  key={cantidad}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="px-1.5 min-w-[1.25rem] text-center text-[11px] font-bold text-trofeo-300 select-none pointer-events-none"
                >
                  x{cantidad}
                </motion.span>
              )}
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
                  'tap-target inline-flex h-7 w-7 items-center justify-center rounded-full',
                  'bg-trofeo-300 text-carbon border border-white/30',
                  'active:scale-90 active:bg-trofeo-400 transition-transform',
                )}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>
          )}
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

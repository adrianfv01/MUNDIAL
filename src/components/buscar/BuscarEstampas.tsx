import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Minus, Plus, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion } from '@/hooks/useColeccion'
import { rangoAlbumEquipo } from '@/data/equipos'
import { normalizarTexto } from '@/lib/normalizar'
import { cn } from '@/lib/utils'
import { useTapNoScroll } from '@/lib/useTapNoScroll'
import type { Equipo, Estampa } from '@/lib/types'

interface BuscarEstampasProps {
  valor: string
  onIrResultado: () => void
}

type Filtro = 'todas' | 'pegadas' | 'faltan' | 'repes'

interface Resultado {
  estampa: Estampa
  equipo?: Equipo
  cantidad: number
}

const LIMITE = 60
// Fallback razonable cuando todavia no leimos el visualViewport (SSR, primer render).
const ALTO_HEADER_PX = 56

const filtros: { id: Filtro; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pegadas', label: 'Pegadas' },
  { id: 'faltan', label: 'Faltan' },
  { id: 'repes', label: 'Repes' },
]

function vibrar(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate?.(ms)
    } catch {
      /* ignorar: algunos navegadores requieren gesto previo */
    }
  }
}

export function BuscarEstampas({ valor, onIrResultado }: BuscarEstampasProps) {
  const { user } = useAuth()
  const { equipos, estampas } = useCatalogo()
  const { coleccion, incrementar, decrementar } = useColeccion(user?.uid)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [altoVisible, setAltoVisible] = useState<number | null>(null)

  // Sincroniza el alto del overlay con el visual viewport para que el contenido
  // no quede oculto detras del teclado en iOS Safari (donde 100dvh y bottom:0
  // siguen midiendo respecto al layout viewport y no al area realmente visible).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) {
      setAltoVisible(window.innerHeight)
      return
    }
    const aplicar = () => setAltoVisible(vv.height)
    aplicar()
    vv.addEventListener('resize', aplicar)
    vv.addEventListener('scroll', aplicar)
    return () => {
      vv.removeEventListener('resize', aplicar)
      vv.removeEventListener('scroll', aplicar)
    }
  }, [])

  const equiposPorCodigo = useMemo(() => {
    const mapa = new Map<string, Equipo>()
    for (const e of equipos) mapa.set(e.codigo, e)
    return mapa
  }, [equipos])

  const resultados = useMemo<Resultado[]>(() => {
    const q = normalizarTexto(valor)
    const lista: Resultado[] = []
    const numeroBuscado = /^\d+$/.test(q.replace('#', ''))
      ? parseInt(q.replace('#', ''), 10)
      : null

    for (const estampa of estampas) {
      const equipo = equiposPorCodigo.get(estampa.equipoId)
      const cantidad = coleccion[estampa.id]?.cantidad ?? 0

      if (filtro === 'pegadas' && cantidad === 0) continue
      if (filtro === 'faltan' && cantidad > 0) continue
      if (filtro === 'repes' && cantidad < 2) continue

      if (q.length > 0) {
        const camposBusqueda = [
          estampa.nombre,
          estampa.id,
          estampa.equipoId,
          estampa.posicion,
          equipo?.nombre,
          equipo?.confederacion,
          equipo?.grupo,
        ]
        const match = camposBusqueda.some((campo) =>
          normalizarTexto(campo).includes(q),
        )
        const matchNumero = numeroBuscado !== null && estampa.numero === numeroBuscado
        if (!match && !matchNumero) continue
      }

      lista.push({ estampa, equipo, cantidad })
    }

    lista.sort((a, b) => {
      const ra = rangoAlbumEquipo(a.estampa.equipoId)
      const rb = rangoAlbumEquipo(b.estampa.equipoId)
      if (ra !== rb) return ra - rb
      return a.estampa.orden - b.estampa.orden
    })

    return lista.slice(0, LIMITE * 2)
  }, [valor, filtro, estampas, equiposPorCodigo, coleccion])

  const visibles = resultados.slice(0, LIMITE)
  const restantes = resultados.length - visibles.length
  const sinTexto = valor.trim().length === 0

  const estiloPanel = altoVisible
    ? { height: `${Math.max(0, altoVisible - ALTO_HEADER_PX)}px` }
    : undefined

  return (
    <div
      className={cn(
        // z-40 para quedar por encima del BottomNav (z-30) y de cualquier
        // pildora de stepper que pudiera promoverse a un z alto. El header
        // sigue arriba (z-30) pero como este panel se ancla en top-14 nunca
        // lo tapa visualmente.
        'fixed inset-x-0 top-14 lg:top-16 z-40 flex flex-col bg-carbon',
      )}
      style={estiloPanel ?? { bottom: 0 }}
      role="dialog"
      aria-label="Resultados de busqueda"
    >
      {/* Capa base totalmente opaca: evita que las pildoras +/- de las cards
          de abajo se transparenten en iOS, donde backdrop-blur a veces falla. */}
      <div aria-hidden className="absolute inset-0 bg-carbon" />

      <div className="relative mx-auto w-full max-w-3xl lg:max-w-6xl px-3 sm:px-4 lg:px-6 flex flex-col flex-1 min-h-0">
        <div className="sticky top-0 z-10 bg-carbon pt-3 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filtros.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider tap-target border transition shrink-0',
                  filtro === f.id
                    ? 'bg-trofeo-300 text-carbon border-trofeo-300'
                    : 'bg-white/5 text-crema/70 border-white/10 hover:text-crema',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-6">
          {sinTexto && filtro === 'todas' ? (
            <div className="pt-6 text-sm text-crema/55 px-1">
              <p className="titulo-display text-base text-crema mb-1">
                Busca cualquier estampa
              </p>
              <p>Escribe un numero, jugador, equipo o pais.</p>
              <p className="text-xs text-crema/45 mt-3">
                Toca una fila para marcarla como pegada o usa los botones - / +
                para ajustar repes sin salir de la busqueda.
              </p>
            </div>
          ) : visibles.length === 0 ? (
            <div className="pt-8 text-sm text-crema/55 px-1">
              Sin coincidencias. Prueba con otro nombre o numero.
            </div>
          ) : (
            <ul className="space-y-1.5 pt-1">
              {visibles.map(({ estampa, equipo, cantidad }) => (
                <ItemResultado
                  key={estampa.id}
                  estampa={estampa}
                  equipo={equipo}
                  cantidad={cantidad}
                  onIncrementar={() => {
                    incrementar(estampa.id)
                    vibrar(8)
                  }}
                  onDecrementar={() => {
                    decrementar(estampa.id)
                    vibrar(12)
                  }}
                  onIrDetalle={onIrResultado}
                />
              ))}
              {restantes > 0 && (
                <li className="text-center text-[11px] text-crema/40 py-3">
                  Refina tu busqueda para ver {restantes} resultados mas.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

interface ItemResultadoProps {
  estampa: Estampa
  equipo?: Equipo
  cantidad: number
  onIncrementar: () => void
  onDecrementar: () => void
  onIrDetalle: () => void
}

interface Flotante {
  id: number
  delta: 1 | -1
}

function ItemResultado({
  estampa,
  equipo,
  cantidad,
  onIncrementar,
  onDecrementar,
  onIrDetalle,
}: ItemResultadoProps) {
  const tienes = cantidad > 0
  const repe = cantidad > 1
  const especial = estampa.tipo === 'especial' || estampa.equipoId === 'FWC'
  const nombreEquipo = especial ? 'Especiales FWC' : (equipo?.nombre ?? estampa.equipoId)
  const subtitulo = especial
    ? estampa.tipo
    : equipo
      ? `${equipo.confederacion} · Grupo ${equipo.grupo}`
      : estampa.equipoId

  const [flotantes, setFlotantes] = useState<Flotante[]>([])
  const idRef = useRef(0)

  const empujarFeedback = useCallback((delta: 1 | -1) => {
    const id = ++idRef.current
    setFlotantes((prev) => [...prev, { id, delta }])
    window.setTimeout(() => {
      setFlotantes((prev) => prev.filter((f) => f.id !== id))
    }, 600)
  }, [])

  const sumarSiFalta = useCallback(() => {
    if (tienes) return
    onIncrementar()
    empujarFeedback(1)
  }, [tienes, onIncrementar, empujarFeedback])

  const tapHandlers = useTapNoScroll<HTMLDivElement>(sumarSiFalta)

  const sumarStepper = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    onIncrementar()
    empujarFeedback(1)
  }

  const restarStepper = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    if (cantidad <= 0) return
    onDecrementar()
    empujarFeedback(-1)
  }

  return (
    <li>
      <div
        className={cn(
          'relative flex items-center gap-3 rounded-xl border px-2.5 py-2 transition select-none',
          tienes
            ? 'border-trofeo-300/40 bg-trofeo-300/5'
            : 'border-white/10 bg-white/[0.03] cursor-pointer active:bg-white/[0.07]',
        )}
        role={tienes ? undefined : 'button'}
        aria-label={
          tienes
            ? `${estampa.nombre} (tienes ${cantidad})`
            : `${estampa.nombre} (te falta, toca para marcar como pegada)`
        }
        {...(tienes ? {} : tapHandlers)}
      >
        <div className="shrink-0">
          {especial ? (
            <div className="h-10 w-10 rounded-full bg-trofeo-300/20 border border-trofeo-300/40 flex items-center justify-center text-trofeo-300">
              <Star className="h-5 w-5" fill="currentColor" />
            </div>
          ) : equipo ? (
            <img
              src={`https://flagcdn.com/${equipo.bandera.toLowerCase()}.svg`}
              alt={equipo.nombre}
              className="h-10 w-10 rounded-full object-cover border border-white/30"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="titulo-display text-sm text-trofeo-300">
              #{estampa.numero}
            </span>
            <span className="text-sm text-crema truncate">{estampa.nombre}</span>
          </div>
          <p className="text-[11px] text-crema/55 truncate">
            {nombreEquipo}
            {subtitulo ? ` · ${subtitulo}` : ''}
          </p>
        </div>

        {/* Stepper inline: siempre disponible para +/- repes sin salir del panel.
            Cuando aun no tienes la estampa, el stepper queda visualmente
            secundario porque el tap en el centro ya basta para marcarla. */}
        <div
          className={cn(
            'shrink-0 inline-flex items-center rounded-full p-0.5 gap-0.5',
            'border shadow-md backdrop-blur-sm',
            tienes
              ? 'bg-carbon/90 border-white/25'
              : 'bg-white/5 border-white/15',
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={restarStepper}
            disabled={cantidad <= 0}
            aria-label={`Restar una de ${estampa.nombre}`}
            className={cn(
              'tap-target inline-flex h-7 w-7 items-center justify-center rounded-full',
              'bg-white/10 text-crema active:scale-90 active:bg-rojo/80 transition-transform',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
          <span
            key={cantidad}
            className={cn(
              'min-w-[1.5rem] px-1 text-center text-[11px] font-bold select-none',
              cantidad === 0
                ? 'text-crema/45'
                : repe
                  ? 'text-trofeo-300'
                  : 'text-campo-300',
            )}
            aria-live="polite"
          >
            {repe ? `x${cantidad}` : cantidad === 1 ? '1' : '0'}
          </span>
          <button
            type="button"
            onClick={sumarStepper}
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

        <Link
          to={`/equipo/${estampa.equipoId}?estampa=${encodeURIComponent(estampa.id)}`}
          onClick={onIrDetalle}
          aria-label={`Ver ${estampa.nombre} en su equipo`}
          className={cn(
            'shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full',
            'text-crema/60 hover:text-crema hover:bg-white/10 active:bg-white/15 tap-target',
          )}
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>

        <AnimatePresence>
          {flotantes.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -22, scale: 1 }}
              exit={{ opacity: 0, y: -34 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 z-10',
                'titulo-display text-lg drop-shadow',
                f.delta === 1 ? 'text-trofeo-200' : 'text-rojo',
              )}
            >
              {f.delta === 1 ? '+1' : '-1'}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </li>
  )
}

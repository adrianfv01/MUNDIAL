import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion } from '@/hooks/useColeccion'
import { normalizarTexto } from '@/lib/normalizar'
import { cn } from '@/lib/utils'
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

const filtros: { id: Filtro; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pegadas', label: 'Pegadas' },
  { id: 'faltan', label: 'Faltan' },
  { id: 'repes', label: 'Repes' },
]

export function BuscarEstampas({ valor, onIrResultado }: BuscarEstampasProps) {
  const { user } = useAuth()
  const { equipos, estampas } = useCatalogo()
  const { coleccion } = useColeccion(user?.uid)
  const [filtro, setFiltro] = useState<Filtro>('todas')

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
      if (a.estampa.equipoId !== b.estampa.equipoId) {
        return a.estampa.equipoId.localeCompare(b.estampa.equipoId)
      }
      return a.estampa.orden - b.estampa.orden
    })

    return lista.slice(0, LIMITE * 2)
  }, [valor, filtro, estampas, equiposPorCodigo, coleccion])

  const visibles = resultados.slice(0, LIMITE)
  const restantes = resultados.length - visibles.length
  const sinTexto = valor.trim().length === 0

  return (
    <div
      className="fixed inset-x-0 top-14 lg:top-16 bottom-0 z-20 bg-carbon/95 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-label="Resultados de búsqueda"
    >
      <div className="mx-auto w-full max-w-3xl lg:max-w-6xl px-3 sm:px-4 lg:px-6 flex flex-col flex-1 min-h-0">
        <div className="sticky top-0 z-10 bg-carbon/95 backdrop-blur-md pt-3 pb-2">
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

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-24 sm:pb-6">
          {sinTexto && filtro === 'todas' ? (
            <div className="text-center py-10 text-sm text-crema/50 px-4">
              Escribe un número, jugador, equipo o país.
            </div>
          ) : visibles.length === 0 ? (
            <div className="text-center py-10 text-sm text-crema/50 px-4">
              Sin coincidencias. Prueba con otro nombre o número.
            </div>
          ) : (
            <ul className="space-y-1.5 pt-1">
              {visibles.map(({ estampa, equipo, cantidad }) => (
                <ItemResultado
                  key={estampa.id}
                  estampa={estampa}
                  equipo={equipo}
                  cantidad={cantidad}
                  onIr={onIrResultado}
                />
              ))}
              {restantes > 0 && (
                <li className="text-center text-[11px] text-crema/40 py-3">
                  Refina tu búsqueda para ver {restantes} resultados más.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function ItemResultado({
  estampa,
  equipo,
  cantidad,
  onIr,
}: {
  estampa: Estampa
  equipo?: Equipo
  cantidad: number
  onIr: () => void
}) {
  const tienes = cantidad > 0
  const repe = cantidad > 1
  const especial = estampa.tipo === 'especial' || estampa.equipoId === 'FWC'
  const nombreEquipo = especial ? 'Especiales FWC' : equipo?.nombre ?? estampa.equipoId
  const subtitulo = especial
    ? estampa.tipo
    : equipo
      ? `${equipo.confederacion} · Grupo ${equipo.grupo}`
      : estampa.equipoId

  return (
    <li>
      <Link
        to={`/equipo/${estampa.equipoId}?estampa=${encodeURIComponent(estampa.id)}`}
        onClick={onIr}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-2.5 py-2 tap-target transition',
          tienes
            ? 'border-trofeo-300/40 bg-trofeo-300/5 hover:bg-trofeo-300/10'
            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]',
        )}
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
            <span className="titulo-display text-sm text-trofeo-300">#{estampa.numero}</span>
            <span className="text-sm text-crema truncate">{estampa.nombre}</span>
          </div>
          <p className="text-[11px] text-crema/55 truncate">
            {nombreEquipo}
            {subtitulo ? ` · ${subtitulo}` : ''}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {tienes ? (
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                repe
                  ? 'bg-trofeo-300 text-carbon'
                  : 'bg-campo-500/80 text-white border border-campo-300/40',
              )}
            >
              {repe ? `x${cantidad}` : 'Tienes'}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-crema/70 border border-white/10">
              Falta
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}

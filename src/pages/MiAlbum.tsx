import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Star, StickyNote, Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, useResumen } from '@/hooks/useColeccion'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { EquipoCard } from '@/components/equipos/EquipoCard'
import {
  VistaEstampasAlbum,
  type FiltroAlbum,
} from '@/components/equipos/VistaEstampasAlbum'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type ModoAlbum = 'equipos' | 'estampas'

const CLAVE_VISTA = 'mundial26:vistaAlbum'

interface PreferenciaVista {
  modo: ModoAlbum
  filtro: FiltroAlbum
}

function leerPreferencia(): PreferenciaVista {
  if (typeof window === 'undefined') return { modo: 'equipos', filtro: 'todas' }
  try {
    const raw = window.localStorage.getItem(CLAVE_VISTA)
    if (!raw) return { modo: 'equipos', filtro: 'todas' }
    const data = JSON.parse(raw) as Partial<PreferenciaVista>
    const modo: ModoAlbum = data.modo === 'estampas' ? 'estampas' : 'equipos'
    const filtro: FiltroAlbum =
      data.filtro === 'faltantes' || data.filtro === 'repetidas' ? data.filtro : 'todas'
    return { modo, filtro }
  } catch {
    return { modo: 'equipos', filtro: 'todas' }
  }
}

export function MiAlbumPage() {
  const { user } = useAuth()
  const { equipos, estampas, cargando: cargandoCat } = useCatalogo()
  const { coleccion, cargando: cargandoCol, incrementar, decrementar } = useColeccion(user?.uid)

  const resumen = useResumen(coleccion, estampas)

  const [{ modo, filtro }, setPreferencia] = useState<PreferenciaVista>(() => leerPreferencia())

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CLAVE_VISTA, JSON.stringify({ modo, filtro }))
    } catch {
      // sin acceso a storage: ignoramos
    }
  }, [modo, filtro])

  const cambiarModo = (nuevo: ModoAlbum) =>
    setPreferencia((prev) => ({ ...prev, modo: nuevo }))
  const cambiarFiltro = (nuevo: FiltroAlbum) =>
    setPreferencia((prev) => ({ ...prev, filtro: nuevo }))

  const especiales = useMemo(() => estampas.filter((e) => e.tipo === 'especial'), [estampas])
  const especialesPegadas = useMemo(
    () => especiales.filter((e) => (coleccion[e.id]?.cantidad ?? 0) > 0).length,
    [especiales, coleccion],
  )

  const porEquipo = useMemo(() => {
    const mapa: Record<string, { total: number; pegadas: number }> = {}
    for (const e of estampas) {
      if (e.equipoId === 'FWC') continue
      mapa[e.equipoId] ??= { total: 0, pegadas: 0 }
      mapa[e.equipoId].total += 1
      if ((coleccion[e.id]?.cantidad ?? 0) > 0) mapa[e.equipoId].pegadas += 1
    }
    return mapa
  }, [estampas, coleccion])

  const equiposPorGrupo = useMemo(() => {
    const mapa: Record<string, typeof equipos> = {}
    for (const eq of equipos) {
      mapa[eq.grupo] ??= []
      mapa[eq.grupo].push(eq)
    }
    return Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b))
  }, [equipos])

  if (cargandoCat || cargandoCol) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-trofeo-300/30 bg-gradient-to-br from-campo-700/60 via-campo-900/60 to-carbon p-5"
      >
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-trofeo-300/15 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-trofeo-300 text-carbon shadow-foil">
            <Trophy className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-crema/60">Mi álbum</p>
            <h1 className="titulo-display text-3xl">Mundial 2026</h1>
          </div>
        </div>
        <div className="relative mt-5">
          <ProgresoBar
            valor={resumen.pegadas}
            total={resumen.total}
            etiqueta="Progreso global"
            acento="trofeo"
            size="lg"
          />
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Pegadas" valor={resumen.pegadas} />
          <Stat label="Faltan" valor={resumen.faltantes} />
          <Stat label="Repes" valor={resumen.repetidas} acento="trofeo" />
        </div>
      </motion.section>

      {especiales.length > 0 && (
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-trofeo-300" fill="currentColor" />
              <h2 className="titulo-display text-lg">Estampas especiales</h2>
            </div>
            <Badge tono="trofeo">
              {especialesPegadas}/{especiales.length}
            </Badge>
          </div>
          <Link
            to="/equipo/FWC"
            className="relative block rounded-xl tap-target overflow-hidden"
          >
            <div className="rounded-xl bg-carbon/85 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="titulo-display text-sm text-trofeo-300">Trofeo, mascotas y sedes</p>
                <p className="text-xs text-crema/60 mt-0.5">{especiales.length} estampas FWC</p>
              </div>
              <ProgresoBar
                valor={especialesPegadas}
                total={especiales.length}
                size="sm"
                mostrarNumeros={false}
                etiqueta=""
                acento="trofeo"
              />
            </div>
            <span aria-hidden className="foil-border" />
          </Link>
        </Card>
      )}

      <SelectorVista modo={modo} onModo={cambiarModo} />

      {modo === 'estampas' && (
        <ChipsFiltroAlbum
          filtro={filtro}
          onFiltro={cambiarFiltro}
          totales={{
            todas: resumen.total,
            faltantes: resumen.faltantes,
            repetidas: resumen.repetidas,
          }}
        />
      )}

      {modo === 'equipos' ? (
        equiposPorGrupo.map(([grupo, eqs]) => (
          <section key={grupo}>
            <div className="flex items-baseline justify-between mb-3 px-1">
              <h2 className="titulo-display text-xl text-crema">Grupo {grupo}</h2>
              <span className="text-xs text-crema/50">{eqs.length} equipos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {eqs.map((eq) => {
                const data = porEquipo[eq.codigo] ?? { total: 0, pegadas: 0 }
                return (
                  <EquipoCard
                    key={eq.codigo}
                    equipo={eq}
                    pegadas={data.pegadas}
                    total={data.total}
                  />
                )
              })}
            </div>
          </section>
        ))
      ) : (
        <VistaEstampasAlbum
          equipos={equipos}
          estampas={estampas}
          coleccion={coleccion}
          filtro={filtro}
          onIncrementar={incrementar}
          onDecrementar={decrementar}
        />
      )}
    </div>
  )
}

function SelectorVista({
  modo,
  onModo,
}: {
  modo: ModoAlbum
  onModo: (m: ModoAlbum) => void
}) {
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-2xl border border-white/10 bg-white/5 w-full sm:w-auto"
      role="tablist"
      aria-label="Modo de vista del álbum"
    >
      <BotonSegmento
        activo={modo === 'equipos'}
        onClick={() => onModo('equipos')}
        icono={<LayoutGrid className="h-3.5 w-3.5" />}
        etiqueta="Equipos"
      />
      <BotonSegmento
        activo={modo === 'estampas'}
        onClick={() => onModo('estampas')}
        icono={<StickyNote className="h-3.5 w-3.5" />}
        etiqueta="Estampas"
      />
    </div>
  )
}

function BotonSegmento({
  activo,
  onClick,
  icono,
  etiqueta,
}: {
  activo: boolean
  onClick: () => void
  icono: React.ReactNode
  etiqueta: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={cn(
        'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider tap-target transition',
        activo
          ? 'bg-trofeo-300 text-carbon shadow-estampa'
          : 'text-crema/65 hover:text-crema',
      )}
    >
      {icono}
      {etiqueta}
    </button>
  )
}

function ChipsFiltroAlbum({
  filtro,
  onFiltro,
  totales,
}: {
  filtro: FiltroAlbum
  onFiltro: (f: FiltroAlbum) => void
  totales: { todas: number; faltantes: number; repetidas: number }
}) {
  const opciones: { id: FiltroAlbum; etiqueta: string; total: number }[] = [
    { id: 'todas', etiqueta: 'Todas', total: totales.todas },
    { id: 'faltantes', etiqueta: 'Faltantes', total: totales.faltantes },
    { id: 'repetidas', etiqueta: 'Repetidas', total: totales.repetidas },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {opciones.map((op) => (
        <button
          key={op.id}
          type="button"
          onClick={() => onFiltro(op.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider tap-target border transition shrink-0',
            filtro === op.id
              ? 'bg-trofeo-300 text-carbon border-trofeo-300'
              : 'bg-white/5 text-crema/70 border-white/10 hover:text-crema',
          )}
        >
          {op.etiqueta}
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              filtro === op.id ? 'bg-carbon/20 text-carbon' : 'bg-white/10 text-crema/70',
            )}
          >
            {op.total}
          </span>
        </button>
      ))}
    </div>
  )
}

function Stat({
  label,
  valor,
  acento,
}: {
  label: string
  valor: number
  acento?: 'trofeo' | 'campo'
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 py-2">
      <p
        className={`titulo-display text-2xl ${
          acento === 'trofeo' ? 'text-trofeo-300' : 'text-crema'
        }`}
      >
        {valor}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-crema/60">{label}</p>
    </div>
  )
}

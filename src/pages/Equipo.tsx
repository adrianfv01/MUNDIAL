import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Filter, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCatalogo, useEstampasEquipo } from '@/hooks/useCatalogo'
import { useColeccion } from '@/hooks/useColeccion'
import { StickerCard } from '@/components/estampas/StickerCard'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type Filtro = 'todas' | 'pegadas' | 'faltan' | 'repes'

export function EquipoPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const { user } = useAuth()
  const { equipos, cargando: cargandoCat } = useCatalogo()
  const { estampas, cargando: cargandoEqs } = useEstampasEquipo(codigo)
  const { coleccion, incrementar, decrementar } = useColeccion(user?.uid)

  const [filtro, setFiltro] = useState<Filtro>('todas')

  const equipo = useMemo(() => equipos.find((e) => e.codigo === codigo), [equipos, codigo])
  const esEspeciales = codigo === 'FWC'

  const stats = useMemo(() => {
    let pegadas = 0
    let repes = 0
    for (const e of estampas) {
      const c = coleccion[e.id]?.cantidad ?? 0
      if (c > 0) pegadas += 1
      if (c > 1) repes += c - 1
    }
    return { pegadas, repes, total: estampas.length, faltan: estampas.length - pegadas }
  }, [estampas, coleccion])

  const visibles = useMemo(() => {
    return estampas.filter((e) => {
      const c = coleccion[e.id]?.cantidad ?? 0
      if (filtro === 'pegadas') return c > 0
      if (filtro === 'faltan') return c === 0
      if (filtro === 'repes') return c > 1
      return true
    })
  }, [estampas, coleccion, filtro])

  if (cargandoCat || cargandoEqs) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    )
  }

  if (!equipo && !esEspeciales) {
    return (
      <div className="text-center py-20">
        <p className="text-crema/60">No se encontro el equipo</p>
        <Link to="/" className="text-trofeo-300 underline mt-2 inline-block">
          Volver al album
        </Link>
      </div>
    )
  }

  const colorPri = esEspeciales ? '#F2C14E' : equipo!.colorPrimario
  const colorSec = esEspeciales ? '#0E7C3A' : equipo!.colorSecundario
  const nombre = esEspeciales ? 'Especiales FWC' : equipo!.nombre
  const subtitulo = esEspeciales
    ? 'Mascotas, trofeo, sedes y leyendas'
    : `Grupo ${equipo!.grupo} · ${equipo!.confederacion}`

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-trofeo-300/30 p-5"
        style={{
          backgroundImage: `linear-gradient(135deg, ${colorPri}, ${colorSec})`,
        }}
      >
        <div className="absolute inset-0 bg-carbon/30" />
        <div className="relative flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur tap-target"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {esEspeciales ? (
            <div className="h-12 w-12 rounded-full bg-trofeo-300 flex items-center justify-center text-carbon">
              <Star className="h-6 w-6" fill="currentColor" />
            </div>
          ) : (
            <img
              src={`https://flagcdn.com/${equipo!.bandera.toLowerCase()}.svg`}
              alt={equipo!.nombre}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 rounded-full object-cover border-2 border-white/40 shadow"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="titulo-display text-3xl text-white drop-shadow truncate">{nombre}</h1>
            <p className="text-xs uppercase tracking-wider text-white/80">{subtitulo}</p>
          </div>
        </div>
        <div className="relative mt-4">
          <ProgresoBar
            valor={stats.pegadas}
            total={stats.total}
            etiqueta="Avance"
            acento="trofeo"
          />
        </div>
        <div className="relative mt-3 flex items-center gap-2 flex-wrap">
          <Badge tono="campo">{stats.pegadas} pegadas</Badge>
          <Badge tono="trofeo">{stats.repes} repes</Badge>
          <Badge tono="rojo">{stats.faltan} faltan</Badge>
        </div>
      </motion.div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-crema/50 shrink-0" />
        {(['todas', 'pegadas', 'faltan', 'repes'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider tap-target border transition shrink-0',
              filtro === f
                ? 'bg-trofeo-300 text-carbon border-trofeo-300'
                : 'bg-white/5 text-crema/70 border-white/10 hover:text-crema',
            )}
          >
            {f === 'todas' ? 'Todas' : f === 'pegadas' ? 'Pegadas' : f === 'faltan' ? 'Faltan' : 'Repes'}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="text-center text-crema/50 py-10">No hay estampas para mostrar</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {visibles.map((e) => (
            <StickerCard
              key={e.id}
              estampa={e}
              cantidad={coleccion[e.id]?.cantidad ?? 0}
              colorEquipo={colorPri}
              colorSecundario={colorSec}
              bandera={esEspeciales ? undefined : equipo!.bandera}
              onIncrementar={() => incrementar(e.id)}
              onDecrementar={() => decrementar(e.id)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-crema/40 pt-4">
        Toca la estampa para sumar. Usa los botones &minus; / &plus; para ajustar repes.
      </p>
    </div>
  )
}

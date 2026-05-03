import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, useResumen } from '@/hooks/useColeccion'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { EquipoCard } from '@/components/equipos/EquipoCard'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'

export function MiAlbumPage() {
  const { user } = useAuth()
  const { equipos, estampas, cargando: cargandoCat } = useCatalogo()
  const { coleccion, cargando: cargandoCol } = useColeccion(user?.uid)

  const resumen = useResumen(coleccion, estampas)

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

  const equiposPorConfederacion = useMemo(() => {
    const mapa: Record<string, typeof equipos> = {}
    for (const eq of equipos) {
      mapa[eq.confederacion] ??= []
      mapa[eq.confederacion].push(eq)
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
            className="block rounded-xl border border-trofeo-300/30 bg-foil-gradient bg-[length:300%_300%] animate-foil-shift p-[1.5px] tap-target overflow-hidden"
          >
            <div className="rounded-[10px] bg-carbon/85 px-4 py-3 flex items-center justify-between">
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
          </Link>
        </Card>
      )}

      {equiposPorConfederacion.map(([conf, eqs]) => (
        <section key={conf}>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="titulo-display text-xl text-crema">{conf}</h2>
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

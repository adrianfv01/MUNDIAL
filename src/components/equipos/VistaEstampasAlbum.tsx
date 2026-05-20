import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { StickerCard } from '@/components/estampas/StickerCard'
import { CODIGO_FWC, rangoAlbumEquipo } from '@/data/equipos'
import type { Coleccion, Equipo, Estampa } from '@/lib/types'

export type FiltroAlbum = 'todas' | 'faltantes' | 'repetidas'

interface VistaEstampasAlbumProps {
  equipos: Equipo[]
  estampas: Estampa[]
  coleccion: Coleccion
  filtro: FiltroAlbum
  onIncrementar: (estampaId: string) => void
  onDecrementar: (estampaId: string) => void
}

interface GrupoEquipo {
  equipo: Equipo | null
  codigoEquipo: string
  estampas: Estampa[]
}

interface GrupoMundial {
  grupo: string
  equipos: GrupoEquipo[]
}

// Etiqueta especial para el bloque de FWC (estampas sin equipo).
const GRUPO_FWC = CODIGO_FWC

export function VistaEstampasAlbum({
  equipos,
  estampas,
  coleccion,
  filtro,
  onIncrementar,
  onDecrementar,
}: VistaEstampasAlbumProps) {
  const equiposPorCodigo = useMemo(() => {
    const mapa: Record<string, Equipo> = {}
    for (const eq of equipos) mapa[eq.codigo] = eq
    return mapa
  }, [equipos])

  const grupos = useMemo<GrupoMundial[]>(() => {
    const filtradas = estampas.filter((e) => {
      const c = coleccion[e.id]?.cantidad ?? 0
      if (filtro === 'faltantes') return c === 0
      if (filtro === 'repetidas') return c > 1
      return true
    })

    const porEquipo = new Map<string, Estampa[]>()
    for (const e of filtradas) {
      const lista = porEquipo.get(e.equipoId) ?? []
      lista.push(e)
      porEquipo.set(e.equipoId, lista)
    }

    const porGrupo = new Map<string, GrupoEquipo[]>()
    for (const [codigoEquipo, lista] of porEquipo) {
      const equipo = equiposPorCodigo[codigoEquipo] ?? null
      const grupo = equipo?.grupo ?? GRUPO_FWC
      const ordenadas = [...lista].sort((a, b) => a.orden - b.orden || a.numero - b.numero)
      const arr = porGrupo.get(grupo) ?? []
      arr.push({ equipo, codigoEquipo, estampas: ordenadas })
      porGrupo.set(grupo, arr)
    }

    const resultado: GrupoMundial[] = []
    for (const [grupo, equiposGrupo] of porGrupo) {
      equiposGrupo.sort(
        (a, b) => rangoAlbumEquipo(a.codigoEquipo) - rangoAlbumEquipo(b.codigoEquipo),
      )
      resultado.push({ grupo, equipos: equiposGrupo })
    }

    // FWC va primero (paginas 1-7 del album), luego los grupos A-L.
    return resultado.sort((a, b) => {
      if (a.grupo === GRUPO_FWC) return -1
      if (b.grupo === GRUPO_FWC) return 1
      return a.grupo.localeCompare(b.grupo)
    })
  }, [estampas, coleccion, filtro, equiposPorCodigo])

  if (grupos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center">
        <p className="titulo-display text-lg text-crema">
          {filtro === 'faltantes'
            ? '¡Ya tienes todas las estampas!'
            : filtro === 'repetidas'
              ? 'No tienes estampas repetidas'
              : 'No hay estampas para mostrar'}
        </p>
        <p className="text-xs text-crema/55 mt-1">
          {filtro === 'faltantes'
            ? 'Vuelve cuando salgan nuevas estampas o revisa el modo Equipos.'
            : filtro === 'repetidas'
              ? 'Cuando pegues una estampa que ya tenías, aparecerá aquí.'
              : 'Prueba cambiar el filtro.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {grupos.map(({ grupo, equipos: equiposGrupo }) => {
        const esFWC = grupo === GRUPO_FWC
        const titulo = esFWC ? 'Especiales FWC' : `Grupo ${grupo}`
        return (
          <section key={grupo} className="space-y-4">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="titulo-display text-xl text-crema">{titulo}</h2>
              <span className="text-xs text-crema/50">
                {equiposGrupo.reduce((s, g) => s + g.estampas.length, 0)} estampas
              </span>
            </div>

            <div className="space-y-5">
              {equiposGrupo.map(({ equipo, codigoEquipo, estampas: lista }) => (
                <BloqueEquipo
                  key={codigoEquipo}
                  equipo={equipo}
                  codigoEquipo={codigoEquipo}
                  estampas={lista}
                  coleccion={coleccion}
                  onIncrementar={onIncrementar}
                  onDecrementar={onDecrementar}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

interface BloqueEquipoProps {
  equipo: Equipo | null
  codigoEquipo: string
  estampas: Estampa[]
  coleccion: Coleccion
  onIncrementar: (estampaId: string) => void
  onDecrementar: (estampaId: string) => void
}

function BloqueEquipo({
  equipo,
  codigoEquipo,
  estampas,
  coleccion,
  onIncrementar,
  onDecrementar,
}: BloqueEquipoProps) {
  const colorPri = equipo?.colorPrimario ?? '#F2C14E'
  const colorSec = equipo?.colorSecundario ?? '#0E7C3A'
  const esFWC = !equipo || codigoEquipo === 'FWC'

  const pegadasBloque = estampas.filter((e) => (coleccion[e.id]?.cantidad ?? 0) > 0).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
    >
      <div className="flex items-center gap-2.5 mb-3">
        {esFWC ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-trofeo-300/20 border border-trofeo-300/40 text-trofeo-300">
            <Star className="h-4 w-4" fill="currentColor" />
          </span>
        ) : (
          <img
            src={`https://flagcdn.com/${equipo!.bandera.toLowerCase()}.svg`}
            alt={equipo!.nombre}
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            className="h-9 w-9 rounded-full object-cover border-2 border-white/30 shadow shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="titulo-display text-base leading-tight truncate">
            {equipo?.nombre ?? 'Especiales FWC'}
          </p>
          {equipo && (
            <p className="text-[10px] uppercase tracking-wider text-crema/55">
              Grupo {equipo.grupo}
            </p>
          )}
        </div>
        <span className="text-[11px] font-bold text-crema/70 shrink-0">
          {pegadasBloque}/{estampas.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
        {estampas.map((e) => (
          <StickerCard
            key={e.id}
            estampa={e}
            cantidad={coleccion[e.id]?.cantidad ?? 0}
            colorEquipo={colorPri}
            colorSecundario={colorSec}
            bandera={esFWC ? undefined : equipo!.bandera}
            onIncrementar={() => onIncrementar(e.id)}
            onDecrementar={() => onDecrementar(e.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}

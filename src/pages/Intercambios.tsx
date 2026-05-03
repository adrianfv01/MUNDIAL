import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeftRight,
  ChevronDown,
  Copy,
  Filter,
  Repeat2,
  Search,
  Send,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAmigos } from '@/hooks/useAmigos'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, cargarColeccionUsuario } from '@/hooks/useColeccion'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { Badge } from '@/components/ui/Badge'
import { MiniSticker } from '@/components/estampas/MiniSticker'
import { cn } from '@/lib/utils'
import type { Coleccion, Equipo, Estampa, MatchIntercambio } from '@/lib/types'

type Filtro = 'todos' | 'dobles'
type Vista = 'pares' | 'doy' | 'pido'

export function IntercambiosPage() {
  const { user } = useAuth()
  const { perfiles, cargando: cargAm } = useAmigos(user?.uid)
  const { equipos, estampas, cargando: cargCat } = useCatalogo()
  const { coleccion: miColeccion, cargando: cargMia } = useColeccion(user?.uid)

  const [coleccionesAmigos, setColeccionesAmigos] = useState<Record<string, Coleccion>>({})
  const [cargandoAmigos, setCargandoAmigos] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    if (!perfiles.length) return
    let cancelado = false
    setCargandoAmigos(true)
    Promise.all(
      perfiles.map(async (p) => {
        const col = await cargarColeccionUsuario(p.uid).catch(() => ({} as Coleccion))
        return [p.uid, col] as const
      }),
    )
      .then((entries) => {
        if (cancelado) return
        const mapa: Record<string, Coleccion> = {}
        for (const [uid, col] of entries) mapa[uid] = col
        setColeccionesAmigos(mapa)
      })
      .finally(() => {
        if (!cancelado) setCargandoAmigos(false)
      })
    return () => {
      cancelado = true
    }
  }, [perfiles])

  const matches = useMemo<MatchIntercambio[]>(() => {
    if (!estampas.length) return []
    const lista: MatchIntercambio[] = []

    for (const amigo of perfiles) {
      const colAmigo = coleccionesAmigos[amigo.uid] ?? {}
      const tuOfreces: Estampa[] = []
      const elOfrece: Estampa[] = []

      for (const e of estampas) {
        const yo = miColeccion[e.id]?.cantidad ?? 0
        const otro = colAmigo[e.id]?.cantidad ?? 0
        if (yo > 1 && otro === 0) tuOfreces.push(e)
        if (otro > 1 && yo === 0) elOfrece.push(e)
      }

      const esDoble = tuOfreces.length > 0 && elOfrece.length > 0
      const puntaje = esDoble
        ? Math.min(tuOfreces.length, elOfrece.length) * 10 +
          tuOfreces.length +
          elOfrece.length
        : tuOfreces.length + elOfrece.length

      if (tuOfreces.length === 0 && elOfrece.length === 0) continue

      lista.push({
        amigoUid: amigo.uid,
        amigoUsername: amigo.username,
        amigoDisplayName: amigo.displayName,
        amigoPhotoURL: amigo.photoURL,
        tuOfreces,
        elOfrece,
        esDoble,
        puntaje,
      })
    }

    return lista.sort((a, b) => b.puntaje - a.puntaje)
  }, [perfiles, coleccionesAmigos, miColeccion, estampas])

  const stats = useMemo(() => {
    return {
      conMatch: matches.length,
      dobles: matches.filter((m) => m.esDoble).length,
      puedesPedir: matches.reduce((s, m) => s + m.elOfrece.length, 0),
      puedesOfrecer: matches.reduce((s, m) => s + m.tuOfreces.length, 0),
    }
  }, [matches])

  const matchesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return matches
      .filter((m) => (filtro === 'dobles' ? m.esDoble : true))
      .filter((m) => {
        if (!q) return true
        return (
          m.amigoUsername.toLowerCase().includes(q) ||
          m.amigoDisplayName.toLowerCase().includes(q)
        )
      })
  }, [matches, filtro, busqueda])

  useEffect(() => {
    if (expandido && !matchesFiltrados.find((m) => m.amigoUid === expandido)) {
      setExpandido(null)
    }
    if (!expandido && matchesFiltrados.length > 0 && matchesFiltrados.length <= 2) {
      setExpandido(matchesFiltrados[0].amigoUid)
    }
  }, [matchesFiltrados, expandido])

  const cargandoTodo = cargAm || cargCat || cargMia || cargandoAmigos

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-trofeo-300/20 border border-trofeo-300/40 text-trofeo-300">
          <Repeat2 className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="titulo-display text-3xl">Intercambios</h1>
          <p className="text-xs text-crema/60">
            Empata tus repes con las que faltan a tus amigos
          </p>
        </div>
      </header>

      {cargandoTodo ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : perfiles.length === 0 ? (
        <EstadoVacio
          icono={<ArrowLeftRight className="h-6 w-6" />}
          titulo="Aun no tienes amigos"
          descripcion="Agrega coleccionistas para descubrir intercambios."
          accion={
            <Link
              to="/amigos"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-trofeo-300 text-carbon font-bold uppercase tracking-wider tap-target"
            >
              Buscar amigos
            </Link>
          }
        />
      ) : matches.length === 0 ? (
        <EstadoVacio
          icono={<Trophy className="h-6 w-6" />}
          titulo="Aun no hay matches"
          descripcion="Cuando tu o tus amigos tengan estampas repetidas que se complementen, apareceran aqui."
        />
      ) : (
        <>
          <ResumenGlobal stats={stats} />

          <BarraFiltros
            filtro={filtro}
            onFiltro={setFiltro}
            busqueda={busqueda}
            onBusqueda={setBusqueda}
            totalDobles={stats.dobles}
          />

          {matchesFiltrados.length === 0 ? (
            <EstadoVacio
              icono={<Search className="h-5 w-5" />}
              titulo="Sin resultados"
              descripcion="Prueba quitar el filtro o cambiar la busqueda."
            />
          ) : (
            <div className="space-y-3">
              {matchesFiltrados.map((m) => (
                <MatchAmigoCard
                  key={m.amigoUid}
                  match={m}
                  equipos={equipos}
                  expandido={expandido === m.amigoUid}
                  onToggle={() =>
                    setExpandido((prev) => (prev === m.amigoUid ? null : m.amigoUid))
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ResumenGlobal({
  stats,
}: {
  stats: { conMatch: number; dobles: number; puedesPedir: number; puedesOfrecer: number }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-trofeo-300/30 bg-gradient-to-br from-campo-700/40 via-carbon to-carbon p-4"
    >
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-trofeo-300/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-celeste/10 blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-2 gap-2.5">
        <CeldaResumen
          icono={<Users className="h-4 w-4" />}
          etiqueta="Amigos con match"
          valor={stats.conMatch}
          tono="celeste"
        />
        <CeldaResumen
          icono={<Sparkles className="h-4 w-4" />}
          etiqueta="Matches dobles"
          valor={stats.dobles}
          tono="trofeo"
        />
        <CeldaResumen
          icono={<ArrowLeftRight className="h-4 w-4 rotate-180" />}
          etiqueta="Puedes ofrecer"
          valor={stats.puedesOfrecer}
          tono="campo"
        />
        <CeldaResumen
          icono={<ArrowLeftRight className="h-4 w-4" />}
          etiqueta="Puedes pedir"
          valor={stats.puedesPedir}
          tono="trofeo"
        />
      </div>
    </motion.div>
  )
}

function CeldaResumen({
  icono,
  etiqueta,
  valor,
  tono,
}: {
  icono: React.ReactNode
  etiqueta: string
  valor: number
  tono: 'campo' | 'trofeo' | 'celeste'
}) {
  const colores = {
    campo: 'text-campo-200 bg-campo-500/15 border-campo-300/30',
    trofeo: 'text-trofeo-200 bg-trofeo-300/15 border-trofeo-300/30',
    celeste: 'text-celeste-100 bg-celeste/15 border-celeste/30',
  }[tono]

  return (
    <div className={cn('rounded-2xl border p-3 flex items-center gap-3', colores)}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
        {icono}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider opacity-80">{etiqueta}</p>
        <p className="titulo-display text-2xl leading-none mt-0.5">{valor}</p>
      </div>
    </div>
  )
}

function BarraFiltros({
  filtro,
  onFiltro,
  busqueda,
  onBusqueda,
  totalDobles,
}: {
  filtro: Filtro
  onFiltro: (f: Filtro) => void
  busqueda: string
  onBusqueda: (s: string) => void
  totalDobles: number
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-crema/40" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          placeholder="Buscar amigo por nombre o usuario"
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-crema placeholder:text-crema/40 outline-none focus:border-trofeo-300/60 focus:bg-white/10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-crema/40 ml-1" />
        <ChipFiltro activo={filtro === 'todos'} onClick={() => onFiltro('todos')}>
          Todos
        </ChipFiltro>
        <ChipFiltro
          activo={filtro === 'dobles'}
          onClick={() => onFiltro('dobles')}
          icono={<Sparkles className="h-3 w-3" />}
        >
          Solo dobles{totalDobles > 0 && (
            <span className="ml-1 opacity-70">({totalDobles})</span>
          )}
        </ChipFiltro>
      </div>
    </div>
  )
}

function ChipFiltro({
  activo,
  onClick,
  children,
  icono,
}: {
  activo: boolean
  onClick: () => void
  children: React.ReactNode
  icono?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider tap-target transition',
        activo
          ? 'bg-trofeo-300 text-carbon border-trofeo-300 shadow-estampa'
          : 'bg-white/5 text-crema/80 border-white/10 hover:text-crema',
      )}
    >
      {icono}
      {children}
    </button>
  )
}

function MatchAmigoCard({
  match,
  equipos,
  expandido,
  onToggle,
}: {
  match: MatchIntercambio
  equipos: Equipo[]
  expandido: boolean
  onToggle: () => void
}) {
  const equiposPorCodigo = useMemo(() => {
    const m: Record<string, Equipo> = {}
    for (const eq of equipos) m[eq.codigo] = eq
    return m
  }, [equipos])

  const totalPares = Math.min(match.tuOfreces.length, match.elOfrece.length)

  return (
    <motion.div
      layout
      className={cn(
        'rounded-2xl border bg-white/5 backdrop-blur-md overflow-hidden transition-shadow',
        match.esDoble
          ? 'border-trofeo-300/40 shadow-estampa'
          : 'border-white/10',
        expandido && 'shadow-estampa',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 sm:p-4 text-left tap-target"
        aria-expanded={expandido}
      >
        <Avatar
          nombre={match.amigoDisplayName}
          url={match.amigoPhotoURL}
          tamano={44}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="titulo-display text-base leading-tight truncate">
              {match.amigoDisplayName}
            </p>
            {match.esDoble ? (
              <Badge tono="trofeo" className="shrink-0">
                <Sparkles className="h-3 w-3" /> Doble
              </Badge>
            ) : (
              <Badge tono="celeste" className="shrink-0">
                Parcial
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-crema/55 truncate">@{match.amigoUsername}</p>

          <div className="mt-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="text-campo-200">
              <span className="text-sm">{match.tuOfreces.length}</span>
              <span className="opacity-70 normal-case font-semibold tracking-normal ml-1">
                doy
              </span>
            </span>
            <span className="text-crema/30">|</span>
            <span className="text-trofeo-200">
              <span className="text-sm">{match.elOfrece.length}</span>
              <span className="opacity-70 normal-case font-semibold tracking-normal ml-1">
                pido
              </span>
            </span>
            {totalPares > 0 && (
              <>
                <span className="text-crema/30">|</span>
                <span className="text-crema/70">
                  <span className="text-sm">{totalPares}</span>
                  <span className="opacity-70 normal-case font-semibold tracking-normal ml-1">
                    pares
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: expandido ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-crema/60"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {!expandido && (
        <PreviewBanderas
          tuOfreces={match.tuOfreces}
          elOfrece={match.elOfrece}
          equiposPorCodigo={equiposPorCodigo}
        />
      )}

      <AnimatePresence initial={false}>
        {expandido && (
          <motion.div
            key="contenido"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <ContenidoExpandido
              match={match}
              equiposPorCodigo={equiposPorCodigo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PreviewBanderas({
  tuOfreces,
  elOfrece,
  equiposPorCodigo,
}: {
  tuOfreces: Estampa[]
  elOfrece: Estampa[]
  equiposPorCodigo: Record<string, Equipo>
}) {
  const banderas = (lista: Estampa[]) => {
    const set = new Set<string>()
    for (const e of lista) {
      const eq = equiposPorCodigo[e.equipoId]
      if (eq?.bandera) set.add(eq.bandera)
      if (set.size >= 6) break
    }
    return [...set]
  }

  const tuyas = banderas(tuOfreces)
  const suyas = banderas(elOfrece)

  if (tuyas.length === 0 && suyas.length === 0) return null

  return (
    <div className="px-3 sm:px-4 pb-3 flex items-center gap-2 text-xs">
      <FilaBanderas etiqueta="Tu" banderas={tuyas} acento="campo" total={tuOfreces.length} />
      <span className="text-crema/30">/</span>
      <FilaBanderas etiqueta="El" banderas={suyas} acento="trofeo" total={elOfrece.length} />
    </div>
  )
}

function FilaBanderas({
  etiqueta,
  banderas,
  acento,
  total,
}: {
  etiqueta: string
  banderas: string[]
  acento: 'campo' | 'trofeo'
  total: number
}) {
  if (total === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-crema/40 uppercase tracking-wider">
        {etiqueta}: nada
      </span>
    )
  }
  const restantes = total - banderas.length
  const colorEtiqueta = acento === 'campo' ? 'text-campo-200' : 'text-trofeo-200'

  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <span
        className={cn(
          'text-[10px] uppercase tracking-wider font-bold shrink-0',
          colorEtiqueta,
        )}
      >
        {etiqueta}
      </span>
      <span className="flex -space-x-1.5">
        {banderas.map((b) => (
          <img
            key={b}
            src={`https://flagcdn.com/${b.toLowerCase()}.svg`}
            alt=""
            className="h-5 w-5 rounded-full object-cover border border-carbon"
            loading="lazy"
            decoding="async"
          />
        ))}
      </span>
      {restantes > 0 && (
        <span className="text-[10px] text-crema/50 font-semibold">+{restantes}</span>
      )}
    </span>
  )
}

function ContenidoExpandido({
  match,
  equiposPorCodigo,
}: {
  match: MatchIntercambio
  equiposPorCodigo: Record<string, Equipo>
}) {
  const [vista, setVista] = useState<Vista>(match.esDoble ? 'pares' : 'doy')
  const [copiado, setCopiado] = useState(false)

  const totalPares = Math.min(match.tuOfreces.length, match.elOfrece.length)

  const generarMensaje = () => {
    const lineas: string[] = []
    lineas.push(`Hola @${match.amigoUsername}, te propongo un intercambio del album Mundial 26.`)
    lineas.push('')
    if (match.tuOfreces.length > 0) {
      lineas.push('Te puedo dar:')
      for (const e of match.tuOfreces.slice(0, 25)) {
        const eq = equiposPorCodigo[e.equipoId]
        lineas.push(`- #${e.numero} ${e.nombre}${eq ? ` (${eq.nombre})` : ''}`)
      }
      if (match.tuOfreces.length > 25) {
        lineas.push(`...y ${match.tuOfreces.length - 25} mas.`)
      }
      lineas.push('')
    }
    if (match.elOfrece.length > 0) {
      lineas.push('Y te pediria:')
      for (const e of match.elOfrece.slice(0, 25)) {
        const eq = equiposPorCodigo[e.equipoId]
        lineas.push(`- #${e.numero} ${e.nombre}${eq ? ` (${eq.nombre})` : ''}`)
      }
      if (match.elOfrece.length > 25) {
        lineas.push(`...y ${match.elOfrece.length - 25} mas.`)
      }
    }
    return lineas.join('\n')
  }

  const compartirWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generarMensaje())}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const copiarLista = async () => {
    try {
      await navigator.clipboard.writeText(generarMensaje())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="border-t border-white/5 px-3 sm:px-4 pb-4 pt-3 space-y-3">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
        {match.esDoble && (
          <BotonVista
            activa={vista === 'pares'}
            onClick={() => setVista('pares')}
            etiqueta={`Pares (${totalPares})`}
          />
        )}
        <BotonVista
          activa={vista === 'doy'}
          onClick={() => setVista('doy')}
          etiqueta={`Tu das (${match.tuOfreces.length})`}
          acento="campo"
        />
        <BotonVista
          activa={vista === 'pido'}
          onClick={() => setVista('pido')}
          etiqueta={`El te da (${match.elOfrece.length})`}
          acento="trofeo"
        />
      </div>

      {vista === 'pares' && (
        <PanelPares match={match} equiposPorCodigo={equiposPorCodigo} />
      )}
      {vista === 'doy' && (
        <PanelLista
          estampas={match.tuOfreces}
          equiposPorCodigo={equiposPorCodigo}
          acento="campo"
          vacioMsg="No tienes repetidas que el necesite. Sigue pegando estampas."
        />
      )}
      {vista === 'pido' && (
        <PanelLista
          estampas={match.elOfrece}
          equiposPorCodigo={equiposPorCodigo}
          acento="trofeo"
          vacioMsg="No tiene repetidas que te falten ahora mismo."
        />
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={compartirWhatsApp}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-campo-500 hover:bg-campo-400 text-crema text-xs font-bold uppercase tracking-wider tap-target shadow-estampa"
        >
          <Send className="h-3.5 w-3.5" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={copiarLista}
          className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-crema text-xs font-bold uppercase tracking-wider tap-target"
        >
          <Copy className="h-3.5 w-3.5" />
          {copiado ? 'Copiado' : 'Copiar lista'}
        </button>
        <Link
          to={`/amigo/${match.amigoUsername}`}
          className="ml-auto inline-flex items-center justify-center h-10 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-trofeo-300 hover:text-trofeo-200 tap-target"
        >
          Ver album
        </Link>
      </div>
    </div>
  )
}

function BotonVista({
  activa,
  onClick,
  etiqueta,
  acento,
}: {
  activa: boolean
  onClick: () => void
  etiqueta: string
  acento?: 'campo' | 'trofeo'
}) {
  const colorActivo =
    acento === 'campo'
      ? 'bg-campo-500 text-crema'
      : acento === 'trofeo'
        ? 'bg-trofeo-300 text-carbon'
        : 'bg-white/15 text-crema'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 h-9 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider tap-target transition',
        activa ? colorActivo : 'text-crema/65 hover:text-crema',
      )}
    >
      {etiqueta}
    </button>
  )
}

function PanelPares({
  match,
  equiposPorCodigo,
}: {
  match: MatchIntercambio
  equiposPorCodigo: Record<string, Equipo>
}) {
  const total = Math.min(match.tuOfreces.length, match.elOfrece.length)
  const pares = Array.from({ length: total }, (_, i) => ({
    mia: match.tuOfreces[i],
    suya: match.elOfrece[i],
  }))

  if (total === 0) {
    return (
      <p className="text-sm text-crema/55 text-center py-4">
        No hay pares posibles todavia. Revisa &quot;tu das&quot; o &quot;el te da&quot;.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1 text-[10px] uppercase tracking-wider">
        <span className="text-campo-200 font-bold">Tu entregas</span>
        <span className="text-crema/30">por</span>
        <span className="text-trofeo-200 font-bold text-right">El entrega</span>
      </div>
      <div className="space-y-1.5">
        {pares.map(({ mia, suya }, idx) => {
          const eqMia = equiposPorCodigo[mia.equipoId]
          const eqSuya = equiposPorCodigo[suya.equipoId]
          return (
            <div
              key={`${mia.id}-${suya.id}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              <MiniSticker
                estampa={mia}
                bandera={eqMia?.bandera}
                colorPrimario={eqMia?.colorPrimario}
                colorSecundario={eqMia?.colorSecundario}
                acento="campo"
              />
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-crema/60"
                aria-label={`Par ${idx + 1}`}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </span>
              <MiniSticker
                estampa={suya}
                bandera={eqSuya?.bandera}
                colorPrimario={eqSuya?.colorPrimario}
                colorSecundario={eqSuya?.colorSecundario}
                acento="trofeo"
              />
            </div>
          )
        })}
      </div>

      {(match.tuOfreces.length > total || match.elOfrece.length > total) && (
        <p className="text-[11px] text-crema/55 text-center pt-2">
          Hay {Math.abs(match.tuOfreces.length - match.elOfrece.length)} extra
          {match.tuOfreces.length > match.elOfrece.length ? ' que tu puedes ofrecer' : ' que el puede ofrecer'}.
          Revisa las pestanas para verlas.
        </p>
      )}
    </div>
  )
}

function PanelLista({
  estampas,
  equiposPorCodigo,
  acento,
  vacioMsg,
}: {
  estampas: Estampa[]
  equiposPorCodigo: Record<string, Equipo>
  acento: 'campo' | 'trofeo'
  vacioMsg: string
}) {
  const agrupadas = useMemo(() => {
    const mapa = new Map<string, Estampa[]>()
    for (const e of estampas) {
      const lista = mapa.get(e.equipoId) ?? []
      lista.push(e)
      mapa.set(e.equipoId, lista)
    }
    return [...mapa.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [estampas])

  if (estampas.length === 0) {
    return <p className="text-sm text-crema/55 text-center py-4">{vacioMsg}</p>
  }

  return (
    <div className="space-y-3">
      {agrupadas.map(([codigo, lista]) => {
        const eq = equiposPorCodigo[codigo]
        return (
          <div key={codigo}>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              {eq?.bandera && (
                <img
                  src={`https://flagcdn.com/${eq.bandera.toLowerCase()}.svg`}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover border border-white/20"
                />
              )}
              <span className="text-[11px] uppercase tracking-wider font-bold text-crema/70 truncate">
                {eq?.nombre ?? codigo}
              </span>
              <span className="text-[10px] text-crema/40">{lista.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {lista
                .sort((a, b) => a.numero - b.numero)
                .map((e) => (
                  <MiniSticker
                    key={e.id}
                    estampa={e}
                    bandera={eq?.bandera}
                    colorPrimario={eq?.colorPrimario}
                    colorSecundario={eq?.colorSecundario}
                    acento={acento}
                  />
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

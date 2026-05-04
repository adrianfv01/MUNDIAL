import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeftRight,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  Copy,
  Filter,
  Repeat2,
  Search,
  Send,
  Sparkles,
  Square,
  Trophy,
  Users,
  X,
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

type ResultadoIntercambio = {
  miOk: boolean
  amigoOk: boolean
  miError: string | null
  amigoError: string | null
}

type AplicarIntercambioFn = (args: {
  entregas: string[]
  recibes: string[]
  amigoUid: string
}) => Promise<ResultadoIntercambio>

type Filtro = 'todos' | 'dobles'
type Vista = 'pares' | 'doy' | 'pido'

export function IntercambiosPage() {
  const { user } = useAuth()
  const { perfiles, cargando: cargAm } = useAmigos(user?.uid)
  const { equipos, estampas, cargando: cargCat } = useCatalogo()
  const {
    coleccion: miColeccion,
    cargando: cargMia,
    aplicarIntercambio,
  } = useColeccion(user?.uid)

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
          titulo="Aún no tienes amigos"
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
          titulo="Aún no hay matches"
          descripcion="Cuando tú o tus amigos tengan estampas repetidas que se complementen, aparecerán aquí."
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
              descripcion="Prueba quitar el filtro o cambiar la búsqueda."
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
                  aplicarIntercambio={aplicarIntercambio}
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
  aplicarIntercambio,
}: {
  match: MatchIntercambio
  equipos: Equipo[]
  expandido: boolean
  onToggle: () => void
  aplicarIntercambio: AplicarIntercambioFn
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
              aplicarIntercambio={aplicarIntercambio}
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
      <FilaBanderas etiqueta="Tú" banderas={tuyas} acento="campo" total={tuOfreces.length} />
      <span className="text-crema/30">/</span>
      <FilaBanderas etiqueta="Él" banderas={suyas} acento="trofeo" total={elOfrece.length} />
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
  aplicarIntercambio,
}: {
  match: MatchIntercambio
  equiposPorCodigo: Record<string, Equipo>
  aplicarIntercambio: AplicarIntercambioFn
}) {
  const [vista, setVista] = useState<Vista>(match.esDoble ? 'pares' : 'doy')
  const [copiado, setCopiado] = useState(false)
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [doySel, setDoySel] = useState<Set<string>>(new Set())
  const [pidoSel, setPidoSel] = useState<Set<string>>(new Set())
  const [aplicando, setAplicando] = useState(false)
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'parcial' | 'error'
    mensaje: string
  } | null>(null)

  const totalPares = Math.min(match.tuOfreces.length, match.elOfrece.length)

  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(() => setAviso(null), 5000)
    return () => window.clearTimeout(t)
  }, [aviso])

  const limpiarSeleccion = () => {
    setDoySel(new Set())
    setPidoSel(new Set())
  }

  const cancelarSeleccion = () => {
    setModoSeleccion(false)
    limpiarSeleccion()
  }

  const toggleDoy = (id: string) => {
    setDoySel((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePido = (id: string) => {
    setPidoSel((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePar = (idMia: string, idSuya: string) => {
    const ambasMarcadas = doySel.has(idMia) && pidoSel.has(idSuya)
    setDoySel((prev) => {
      const next = new Set(prev)
      if (ambasMarcadas) next.delete(idMia)
      else next.add(idMia)
      return next
    })
    setPidoSel((prev) => {
      const next = new Set(prev)
      if (ambasMarcadas) next.delete(idSuya)
      else next.add(idSuya)
      return next
    })
  }

  const marcarTodosLosPares = () => {
    const totalPares = Math.min(match.tuOfreces.length, match.elOfrece.length)
    const nuevoDoy = new Set<string>()
    const nuevoPido = new Set<string>()
    for (let i = 0; i < totalPares; i++) {
      nuevoDoy.add(match.tuOfreces[i].id)
      nuevoPido.add(match.elOfrece[i].id)
    }
    setDoySel(nuevoDoy)
    setPidoSel(nuevoPido)
  }

  const confirmarIntercambio = async () => {
    if (aplicando) return
    if (doySel.size === 0 && pidoSel.size === 0) return
    setAplicando(true)
    try {
      const resultado = await aplicarIntercambio({
        entregas: [...doySel],
        recibes: [...pidoSel],
        amigoUid: match.amigoUid,
      })
      if (resultado.miOk && resultado.amigoOk) {
        setAviso({
          tipo: 'exito',
          mensaje: 'Intercambio aplicado en ambas colecciones.',
        })
      } else if (resultado.miOk && !resultado.amigoOk) {
        setAviso({
          tipo: 'parcial',
          mensaje:
            'Tu colección se actualizó. La de tu amigo se actualizará cuando él abra la app.',
        })
      } else {
        setAviso({
          tipo: 'error',
          mensaje: resultado.miError ?? 'No se pudo aplicar el intercambio.',
        })
      }
      cancelarSeleccion()
    } finally {
      setAplicando(false)
    }
  }

  const generarMensaje = () => {
    const lineas: string[] = []
    lineas.push(`Hola @${match.amigoUsername}, te propongo un intercambio del álbum Mundial 26.`)
    lineas.push('')
    if (match.tuOfreces.length > 0) {
      lineas.push('Te puedo dar:')
      for (const e of match.tuOfreces.slice(0, 25)) {
        const eq = equiposPorCodigo[e.equipoId]
        lineas.push(`- #${e.numero} ${e.nombre}${eq ? ` (${eq.nombre})` : ''}`)
      }
      if (match.tuOfreces.length > 25) {
        lineas.push(`...y ${match.tuOfreces.length - 25} más.`)
      }
      lineas.push('')
    }
    if (match.elOfrece.length > 0) {
      lineas.push('Y te pediría:')
      for (const e of match.elOfrece.slice(0, 25)) {
        const eq = equiposPorCodigo[e.equipoId]
        lineas.push(`- #${e.numero} ${e.nombre}${eq ? ` (${eq.nombre})` : ''}`)
      }
      if (match.elOfrece.length > 25) {
        lineas.push(`...y ${match.elOfrece.length - 25} más.`)
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

  const hayAlgoSeleccionado = doySel.size > 0 || pidoSel.size > 0

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
          etiqueta={`Tú das (${match.tuOfreces.length})`}
          acento="campo"
        />
        <BotonVista
          activa={vista === 'pido'}
          onClick={() => setVista('pido')}
          etiqueta={`Él te da (${match.elOfrece.length})`}
          acento="trofeo"
        />
      </div>

      <BarraModoSeleccion
        modoSeleccion={modoSeleccion}
        onActivar={() => setModoSeleccion(true)}
        onCancelar={cancelarSeleccion}
        onMarcarPares={marcarTodosLosPares}
        onLimpiar={limpiarSeleccion}
        totalPares={totalPares}
        totalSeleccionados={doySel.size + pidoSel.size}
      />

      {vista === 'pares' && (
        <PanelPares
          match={match}
          equiposPorCodigo={equiposPorCodigo}
          modoSeleccion={modoSeleccion}
          doySel={doySel}
          pidoSel={pidoSel}
          onTogglePar={togglePar}
        />
      )}
      {vista === 'doy' && (
        <PanelLista
          estampas={match.tuOfreces}
          equiposPorCodigo={equiposPorCodigo}
          acento="campo"
          vacioMsg="No tienes repetidas que él necesite. Sigue pegando estampas."
          modoSeleccion={modoSeleccion}
          seleccionados={doySel}
          onToggle={toggleDoy}
        />
      )}
      {vista === 'pido' && (
        <PanelLista
          estampas={match.elOfrece}
          equiposPorCodigo={equiposPorCodigo}
          acento="trofeo"
          vacioMsg="No tiene repetidas que te falten ahora mismo."
          modoSeleccion={modoSeleccion}
          seleccionados={pidoSel}
          onToggle={togglePido}
        />
      )}

      <AnimatePresence>
        {aviso && (
          <motion.div
            key={aviso.mensaje}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              'flex items-start gap-2 rounded-xl border px-3 py-2 text-xs',
              aviso.tipo === 'exito' && 'border-campo-300/40 bg-campo-500/15 text-campo-100',
              aviso.tipo === 'parcial' &&
                'border-trofeo-300/40 bg-trofeo-300/10 text-trofeo-100',
              aviso.tipo === 'error' && 'border-rojo/40 bg-rojo/15 text-crema',
            )}
          >
            <Check className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={3} />
            <p className="leading-snug">{aviso.mensaje}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modoSeleccion && hayAlgoSeleccionado && (
          <motion.div
            key="footer-confirmar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="sticky bottom-2 z-10 rounded-2xl border border-trofeo-300/50 bg-carbon/95 backdrop-blur-md p-3 shadow-foil"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[11px] uppercase tracking-wider font-bold text-crema/80">
                <span className="text-campo-200">Entregas {doySel.size}</span>
                <span className="mx-1.5 text-crema/40">·</span>
                <span className="text-trofeo-200">Recibes {pidoSel.size}</span>
              </div>
              <button
                type="button"
                onClick={confirmarIntercambio}
                disabled={aplicando}
                className={cn(
                  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider tap-target shadow-estampa transition',
                  'bg-trofeo-300 text-carbon hover:bg-trofeo-200 active:scale-95',
                  aplicando && 'opacity-70 cursor-wait',
                )}
              >
                {aplicando ? (
                  <Spinner size={16} />
                ) : (
                  <CheckCheck className="h-4 w-4" strokeWidth={3} />
                )}
                {aplicando ? 'Aplicando' : 'Confirmar intercambio'}
              </button>
            </div>
            <p className="text-[10px] text-crema/50 mt-2 leading-snug">
              Restará 1 a cada estampa que entregues y sumará 1 a cada una que recibas, en
              tu colección y en la de @{match.amigoUsername}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
          Ver álbum
        </Link>
      </div>
    </div>
  )
}

function BarraModoSeleccion({
  modoSeleccion,
  onActivar,
  onCancelar,
  onMarcarPares,
  onLimpiar,
  totalPares,
  totalSeleccionados,
}: {
  modoSeleccion: boolean
  onActivar: () => void
  onCancelar: () => void
  onMarcarPares: () => void
  onLimpiar: () => void
  totalPares: number
  totalSeleccionados: number
}) {
  if (!modoSeleccion) {
    return (
      <button
        type="button"
        onClick={onActivar}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-trofeo-300/40 bg-trofeo-300/10 hover:bg-trofeo-300/20 text-trofeo-200 text-xs font-bold uppercase tracking-wider tap-target transition"
      >
        <CheckSquare className="h-4 w-4" />
        Marcar intercambio
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-trofeo-300/40 bg-trofeo-300/10 p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider font-bold text-trofeo-100">
          Modo selección activo
        </p>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-crema/80 text-[10px] font-bold uppercase tracking-wider tap-target"
        >
          <X className="h-3 w-3" />
          Cancelar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {totalPares > 0 && (
          <button
            type="button"
            onClick={onMarcarPares}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-crema text-[10px] font-bold uppercase tracking-wider tap-target"
          >
            <CheckCheck className="h-3 w-3" />
            Marcar {totalPares} pares
          </button>
        )}
        {totalSeleccionados > 0 && (
          <button
            type="button"
            onClick={onLimpiar}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-crema/70 text-[10px] font-bold uppercase tracking-wider tap-target"
          >
            <X className="h-3 w-3" />
            Limpiar ({totalSeleccionados})
          </button>
        )}
        <span className="ml-auto inline-flex items-center text-[10px] uppercase tracking-wider text-crema/55">
          Toca cada estampa para marcarla
        </span>
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
  modoSeleccion,
  doySel,
  pidoSel,
  onTogglePar,
}: {
  match: MatchIntercambio
  equiposPorCodigo: Record<string, Equipo>
  modoSeleccion: boolean
  doySel: Set<string>
  pidoSel: Set<string>
  onTogglePar: (idMia: string, idSuya: string) => void
}) {
  const total = Math.min(match.tuOfreces.length, match.elOfrece.length)
  const pares = Array.from({ length: total }, (_, i) => ({
    mia: match.tuOfreces[i],
    suya: match.elOfrece[i],
  }))

  if (total === 0) {
    return (
      <p className="text-sm text-crema/55 text-center py-4">
        No hay pares posibles todavía. Revisa &quot;tú das&quot; o &quot;él te da&quot;.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-1 text-[10px] uppercase tracking-wider">
        <span className="text-campo-200 font-bold truncate">Tú entregas</span>
        <span className="text-crema/30">por</span>
        <span className="text-trofeo-200 font-bold text-right truncate">Él entrega</span>
      </div>
      <div className="space-y-1.5">
        {pares.map(({ mia, suya }, idx) => {
          const eqMia = equiposPorCodigo[mia.equipoId]
          const eqSuya = equiposPorCodigo[suya.equipoId]
          const parMarcado = doySel.has(mia.id) && pidoSel.has(suya.id)

          const filaInner = (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 w-full">
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

          if (!modoSeleccion) {
            return (
              <div key={`${mia.id}-${suya.id}`}>{filaInner}</div>
            )
          }

          return (
            <button
              key={`${mia.id}-${suya.id}`}
              type="button"
              onClick={() => onTogglePar(mia.id, suya.id)}
              aria-pressed={parMarcado}
              className={cn(
                'flex items-center gap-2 w-full text-left rounded-xl p-1.5 transition tap-target',
                parMarcado
                  ? 'bg-trofeo-300/15 ring-2 ring-trofeo-300/60'
                  : 'hover:bg-white/5 ring-1 ring-white/5',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-md border shrink-0 transition',
                  parMarcado
                    ? 'bg-trofeo-300 border-trofeo-300 text-carbon'
                    : 'border-white/30 text-crema/40',
                )}
              >
                {parMarcado ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </span>
              {filaInner}
            </button>
          )
        })}
      </div>

      {(match.tuOfreces.length > total || match.elOfrece.length > total) && (
        <p className="text-[11px] text-crema/55 text-center pt-2">
          Hay {Math.abs(match.tuOfreces.length - match.elOfrece.length)} extra
          {match.tuOfreces.length > match.elOfrece.length ? ' que tú puedes ofrecer' : ' que él puede ofrecer'}.
          Revisa las pestañas para verlas.
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
  modoSeleccion,
  seleccionados,
  onToggle,
}: {
  estampas: Estampa[]
  equiposPorCodigo: Record<string, Equipo>
  acento: 'campo' | 'trofeo'
  vacioMsg: string
  modoSeleccion: boolean
  seleccionados: Set<string>
  onToggle: (id: string) => void
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

  const ringActivo =
    acento === 'campo' ? 'ring-campo-300/60' : 'ring-trofeo-300/60'
  const fondoActivo =
    acento === 'campo' ? 'bg-campo-500/15' : 'bg-trofeo-300/15'
  const checkActivo =
    acento === 'campo'
      ? 'bg-campo-500 border-campo-500 text-white'
      : 'bg-trofeo-300 border-trofeo-300 text-carbon'

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
                .map((e) => {
                  const item = (
                    <MiniSticker
                      estampa={e}
                      bandera={eq?.bandera}
                      colorPrimario={eq?.colorPrimario}
                      colorSecundario={eq?.colorSecundario}
                      acento={acento}
                    />
                  )

                  if (!modoSeleccion) {
                    return <div key={e.id}>{item}</div>
                  }

                  const marcada = seleccionados.has(e.id)
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onToggle(e.id)}
                      aria-pressed={marcada}
                      className={cn(
                        'flex items-center gap-2 w-full text-left rounded-xl p-1 transition tap-target',
                        marcada
                          ? `${fondoActivo} ring-2 ${ringActivo}`
                          : 'hover:bg-white/5 ring-1 ring-white/5',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-md border shrink-0 transition',
                          marcada ? checkActivo : 'border-white/30 text-crema/40',
                        )}
                      >
                        {marcada ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">{item}</div>
                    </button>
                  )
                })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

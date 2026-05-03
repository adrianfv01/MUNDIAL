import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Repeat2, Sparkles, Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAmigos } from '@/hooks/useAmigos'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, cargarColeccionUsuario } from '@/hooks/useColeccion'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { Badge } from '@/components/ui/Badge'
import { StickerCard } from '@/components/estampas/StickerCard'
import type { Coleccion, Estampa, MatchIntercambio } from '@/lib/types'

export function IntercambiosPage() {
  const { user } = useAuth()
  const { perfiles, cargando: cargAm } = useAmigos(user?.uid)
  const { equipos, estampas, cargando: cargCat } = useCatalogo()
  const { coleccion: miColeccion, cargando: cargMia } = useColeccion(user?.uid)

  const [coleccionesAmigos, setColeccionesAmigos] = useState<Record<string, Coleccion>>({})
  const [cargandoAmigos, setCargandoAmigos] = useState(false)
  const [seleccion, setSeleccion] = useState<string | null>(null)

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
        ? Math.min(tuOfreces.length, elOfrece.length) * 10 + tuOfreces.length + elOfrece.length
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

  const matchSeleccionado = matches.find((m) => m.amigoUid === seleccion) ?? matches[0]

  const cargandoTodo = cargAm || cargCat || cargMia || cargandoAmigos

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-trofeo-300/20 border border-trofeo-300/40 text-trofeo-300">
          <Repeat2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="titulo-display text-3xl">Intercambios</h1>
          <p className="text-xs text-crema/60">Empata tus repes con las que faltan a tus amigos</p>
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
          descripcion="Cuando tu o tus amigos tengan estampas repetidas que se complementen, aparecera aqui."
        />
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1">
            {matches.map((m) => {
              const activo = (matchSeleccionado?.amigoUid ?? null) === m.amigoUid
              return (
                <button
                  key={m.amigoUid}
                  onClick={() => setSeleccion(m.amigoUid)}
                  className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 tap-target transition ${
                    activo
                      ? 'bg-trofeo-300 text-carbon border-trofeo-300'
                      : 'bg-white/5 text-crema/80 border-white/10 hover:text-crema'
                  }`}
                >
                  <Avatar nombre={m.amigoDisplayName} url={m.amigoPhotoURL} tamano={22} />
                  <span className="text-xs font-bold">@{m.amigoUsername}</span>
                  {m.esDoble && (
                    <Sparkles className={`h-3 w-3 ${activo ? 'text-carbon' : 'text-trofeo-300'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {matchSeleccionado && (
            <motion.div
              key={matchSeleccionado.amigoUid}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <Card>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    nombre={matchSeleccionado.amigoDisplayName}
                    url={matchSeleccionado.amigoPhotoURL}
                    tamano={48}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="titulo-display text-lg truncate">
                      {matchSeleccionado.amigoDisplayName}
                    </p>
                    <p className="text-xs text-crema/60">@{matchSeleccionado.amigoUsername}</p>
                  </div>
                  {matchSeleccionado.esDoble ? (
                    <Badge tono="trofeo">
                      <Sparkles className="h-3 w-3" /> Match doble
                    </Badge>
                  ) : (
                    <Badge tono="celeste">Parcial</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-campo-500/15 border border-campo-300/30 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-campo-200">Tu ofreces</p>
                    <p className="titulo-display text-3xl text-campo-200">
                      {matchSeleccionado.tuOfreces.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-trofeo-300/15 border border-trofeo-300/30 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-trofeo-200">El te ofrece</p>
                    <p className="titulo-display text-3xl text-trofeo-200">
                      {matchSeleccionado.elOfrece.length}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Link
                    to={`/amigo/${matchSeleccionado.amigoUsername}`}
                    className="text-xs text-trofeo-300 hover:underline"
                  >
                    Ver album completo
                  </Link>
                </div>
              </Card>

              <SeccionEstampas
                titulo={`Tus repes que el necesita (${matchSeleccionado.tuOfreces.length})`}
                acento="campo"
                estampas={matchSeleccionado.tuOfreces}
                equipos={equipos}
                vacioMsg="No tienes repetidas que el necesite. Sigue pegando estampas."
              />

              <SeccionEstampas
                titulo={`Sus repes que tu necesitas (${matchSeleccionado.elOfrece.length})`}
                acento="trofeo"
                estampas={matchSeleccionado.elOfrece}
                equipos={equipos}
                vacioMsg="No tiene repetidas que te falten ahora mismo."
              />

              <p className="text-center text-[11px] text-crema/40 pt-2">
                Coordinen el intercambio por su medio favorito (WhatsApp, persona, etc.)
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

function SeccionEstampas({
  titulo,
  estampas,
  equipos,
  acento,
  vacioMsg,
}: {
  titulo: string
  estampas: Estampa[]
  equipos: ReturnType<typeof useCatalogo>['equipos']
  acento: 'campo' | 'trofeo'
  vacioMsg: string
}) {
  return (
    <section>
      <h3
        className={`titulo-display text-base mb-2 px-1 ${
          acento === 'trofeo' ? 'text-trofeo-300' : 'text-campo-200'
        }`}
      >
        {titulo}
      </h3>
      {estampas.length === 0 ? (
        <p className="text-sm text-crema/50 px-1">{vacioMsg}</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {estampas.map((e) => {
            const eq = equipos.find((q) => q.codigo === e.equipoId)
            return (
              <StickerCard
                key={e.id}
                estampa={e}
                cantidad={1}
                colorEquipo={eq?.colorPrimario ?? '#F2C14E'}
                colorSecundario={eq?.colorSecundario ?? '#0E7C3A'}
                bandera={eq?.bandera}
                soloLectura
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

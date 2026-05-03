import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Repeat2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, calcularResumen, cargarColeccionUsuario } from '@/hooks/useColeccion'
import { buscarPorUsername } from '@/hooks/useAmigos'
import { Avatar } from '@/components/ui/Avatar'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { Spinner } from '@/components/ui/Spinner'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StickerCard } from '@/components/estampas/StickerCard'
import type { Coleccion, Equipo, PerfilUsuario } from '@/lib/types'

export function PerfilAmigoPage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const { equipos, estampas, cargando: cargCat } = useCatalogo()
  const { coleccion: miColeccion } = useColeccion(user?.uid)

  const [amigo, setAmigo] = useState<PerfilUsuario | null | 'noenc'>('noenc')
  const [colAmigo, setColAmigo] = useState<Coleccion>({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      if (!username) return
      setCargando(true)
      setError(null)
      try {
        const p = await buscarPorUsername(username)
        if (cancelado) return
        if (!p) {
          setAmigo('noenc')
          setCargando(false)
          return
        }
        setAmigo(p)
        const col = await cargarColeccionUsuario(p.uid)
        if (cancelado) return
        setColAmigo(col)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [username])

  const resumen = useMemo(() => calcularResumen(colAmigo, estampas), [colAmigo, estampas])

  const porEquipo = useMemo(() => {
    const mapa: Record<string, { total: number; pegadas: number; equipo: Equipo | null }> = {}
    for (const e of estampas) {
      mapa[e.equipoId] ??= {
        total: 0,
        pegadas: 0,
        equipo: equipos.find((q) => q.codigo === e.equipoId) ?? null,
      }
      mapa[e.equipoId].total += 1
      if ((colAmigo[e.id]?.cantidad ?? 0) > 0) mapa[e.equipoId].pegadas += 1
    }
    return mapa
  }, [estampas, colAmigo, equipos])

  const elOfreceParaTi = useMemo(() => {
    return estampas.filter((e) => {
      const suya = colAmigo[e.id]?.cantidad ?? 0
      const tuya = miColeccion[e.id]?.cantidad ?? 0
      return suya > 1 && tuya === 0
    })
  }, [estampas, colAmigo, miColeccion])

  if (cargCat || cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={36} />
      </div>
    )
  }

  if (amigo === 'noenc') {
    return (
      <EstadoVacio
        titulo="Usuario no encontrado"
        descripcion="No existe un coleccionista con ese nombre."
        accion={
          <Button variante="trofeo" onClick={() => history.back()}>
            Volver
          </Button>
        }
      />
    )
  }

  if (error) {
    return (
      <EstadoVacio
        titulo="No se pudo cargar"
        descripcion={error + '. Asegurate de que sean amigos.'}
      />
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/amigos" className="inline-flex items-center gap-2 text-xs text-crema/60 hover:text-crema">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver a amigos
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-trofeo-300/30 bg-gradient-to-br from-celeste/30 via-campo-700/40 to-carbon p-5"
      >
        <div className="flex items-center gap-3">
          <Avatar nombre={amigo!.displayName} url={amigo!.photoURL} tamano={56} />
          <div className="min-w-0">
            <h1 className="titulo-display text-2xl truncate">{amigo!.displayName}</h1>
            <p className="text-xs text-crema/70">@{amigo!.username}</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgresoBar
            valor={resumen.pegadas}
            total={resumen.total}
            etiqueta="Avance del album"
            acento="celeste"
          />
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Card className="flex-1 !p-3 flex items-center gap-3">
          <div className="rounded-xl bg-trofeo-300/15 border border-trofeo-300/30 p-2 text-trofeo-300">
            <Repeat2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-crema/60">Te puede ofrecer</p>
            <p className="titulo-display text-2xl text-trofeo-300">
              {elOfreceParaTi.length}
              <span className="text-sm text-crema/50 ml-1">estampas</span>
            </p>
          </div>
          <Link
            to="/intercambios"
            className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-trofeo-300 text-carbon text-xs uppercase tracking-wider font-bold tap-target"
          >
            Ver matches
          </Link>
        </Card>
      </div>

      {elOfreceParaTi.length > 0 && (
        <section>
          <h2 className="titulo-display text-lg mb-2 px-1">Sus repes que te faltan</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {elOfreceParaTi.slice(0, 20).map((e) => {
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
        </section>
      )}

      <section>
        <h2 className="titulo-display text-lg mb-2 px-1">Su album</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {equipos.map((eq) => {
            const data = porEquipo[eq.codigo] ?? { total: 0, pegadas: 0 }
            const pct = data.total ? Math.round((data.pegadas / data.total) * 100) : 0
            return (
              <Card key={eq.codigo} className="!p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://flagcdn.com/${eq.bandera.toLowerCase()}.svg`}
                    alt={eq.nombre}
                    className="h-9 w-9 rounded-full object-cover border border-white/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="titulo-display text-sm truncate">{eq.nombre}</p>
                    <p className="text-[10px] text-crema/50 uppercase tracking-wider">
                      {data.pegadas}/{data.total} ({pct}%)
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <ProgresoBar
                    valor={data.pegadas}
                    total={data.total}
                    size="sm"
                    mostrarNumeros={false}
                    etiqueta=""
                    acento={pct === 100 ? 'trofeo' : 'campo'}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

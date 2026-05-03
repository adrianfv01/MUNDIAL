import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Search, Send, Users, UserPlus, UserMinus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { EstadoVacio } from '@/components/ui/EstadoVacio'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  buscarPorUsername,
  useAccionesAmistad,
  useAmigos,
  useSolicitudes,
} from '@/hooks/useAmigos'
import type { PerfilUsuario } from '@/lib/types'

type Tab = 'amigos' | 'solicitudes' | 'buscar'

export function AmigosPage() {
  const { user, perfil } = useAuth()
  const [tab, setTab] = useState<Tab>('amigos')
  const [paraQuitar, setParaQuitar] = useState<PerfilUsuario | null>(null)
  const [quitando, setQuitando] = useState(false)
  const [errorQuitar, setErrorQuitar] = useState<string | null>(null)

  const { perfiles, cargando: cargAm } = useAmigos(user?.uid)
  const { entrantes, salientes, cargando: cargSol } = useSolicitudes(user?.uid)
  const acciones = useAccionesAmistad(user?.uid, perfil)

  const confirmarQuitar = async () => {
    if (!paraQuitar) return
    setErrorQuitar(null)
    setQuitando(true)
    try {
      await acciones.eliminarAmigo(paraQuitar.uid)
      setParaQuitar(null)
    } catch (err) {
      setErrorQuitar(err instanceof Error ? err.message : 'No se pudo quitar al amigo')
    } finally {
      setQuitando(false)
    }
  }

  const tabs: { id: Tab; label: string; cantidad?: number }[] = [
    { id: 'amigos', label: 'Amigos', cantidad: perfiles.length },
    { id: 'solicitudes', label: 'Solicitudes', cantidad: entrantes.length },
    { id: 'buscar', label: 'Buscar', cantidad: undefined },
  ]

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-celeste/20 border border-celeste/40 text-celeste">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h1 className="titulo-display text-3xl">Amigos</h1>
          <p className="text-xs text-crema/60">Encuentra coleccionistas e intercambia estampas</p>
        </div>
      </header>

      <div className="flex rounded-xl bg-white/5 p-1 borde-trofeo">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs uppercase tracking-wider font-bold tap-target transition flex items-center justify-center gap-1.5 ${
              tab === t.id ? 'bg-trofeo-300 text-carbon' : 'text-crema/70 hover:text-crema'
            }`}
          >
            <span>{t.label}</span>
            {t.cantidad !== undefined && t.cantidad > 0 && (
              <span
                className={`inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[10px] font-bold ${
                  tab === t.id ? 'bg-carbon/20 text-carbon' : 'bg-trofeo-300/30 text-trofeo-200'
                }`}
              >
                {t.cantidad}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'amigos' && (
          <motion.div
            key="amigos"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {cargAm ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : perfiles.length === 0 ? (
              <EstadoVacio
                icono={<Users className="h-6 w-6" />}
                titulo="Aún no tienes amigos"
                descripcion="Busca a tus amigos por su nombre de usuario para comenzar a intercambiar."
                accion={
                  <Button onClick={() => setTab('buscar')} variante="trofeo" iconoIzq={<Search className="h-4 w-4" />}>
                    Buscar amigos
                  </Button>
                }
              />
            ) : (
              perfiles.map((p) => (
                <Card key={p.uid} className="!p-3 flex items-center gap-3">
                  <Avatar nombre={p.displayName} url={p.photoURL} tamano={44} />
                  <div className="flex-1 min-w-0">
                    <p className="titulo-display text-base truncate">{p.displayName}</p>
                    <p className="text-xs text-crema/60 truncate">@{p.username}</p>
                  </div>
                  <Link
                    to={`/amigo/${p.username}`}
                    className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs uppercase tracking-wider font-bold tap-target"
                  >
                    Ver álbum
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorQuitar(null)
                      setParaQuitar(p)
                    }}
                    aria-label={`Quitar a @${p.username} de amigos`}
                    title="Quitar amigo"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-rojo/10 hover:bg-rojo/20 text-rojo border border-rojo/30 tap-target"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {tab === 'solicitudes' && (
          <motion.div
            key="solicitudes"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {cargSol ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <>
                <Section titulo="Recibidas" cantidad={entrantes.length}>
                  {entrantes.length === 0 ? (
                    <p className="text-sm text-crema/50 px-1">No tienes solicitudes pendientes.</p>
                  ) : (
                    entrantes.map((s) => (
                      <Card key={s.id} className="!p-3 flex items-center gap-3">
                        <Avatar nombre={s.deUsername} tamano={40} />
                        <div className="flex-1 min-w-0">
                          <p className="titulo-display text-sm">@{s.deUsername}</p>
                          <p className="text-[11px] text-crema/50">Quiere ser tu amigo</p>
                        </div>
                        <Button
                          tamano="sm"
                          variante="trofeo"
                          iconoIzq={<Check className="h-4 w-4" />}
                          onClick={() => acciones.aceptar(s.id, s.de)}
                        >
                          Aceptar
                        </Button>
                        <Button
                          tamano="sm"
                          variante="fantasma"
                          iconoIzq={<X className="h-4 w-4" />}
                          onClick={() => acciones.rechazar(s.id)}
                        >
                          Rechazar
                        </Button>
                      </Card>
                    ))
                  )}
                </Section>

                <Section titulo="Enviadas" cantidad={salientes.length}>
                  {salientes.length === 0 ? (
                    <p className="text-sm text-crema/50 px-1">No has enviado solicitudes.</p>
                  ) : (
                    salientes.map((s) => (
                      <Card key={s.id} className="!p-3 flex items-center gap-3">
                        <Avatar nombre={s.paraUsername} tamano={40} />
                        <div className="flex-1 min-w-0">
                          <p className="titulo-display text-sm">@{s.paraUsername}</p>
                          <p className="text-[11px] text-crema/50">En espera de respuesta</p>
                        </div>
                        <Button
                          tamano="sm"
                          variante="fantasma"
                          onClick={() => acciones.cancelarSolicitud(s.id)}
                        >
                          Cancelar
                        </Button>
                      </Card>
                    ))
                  )}
                </Section>
              </>
            )}
          </motion.div>
        )}

        {tab === 'buscar' && (
          <BuscarAmigo
            uid={user?.uid}
            perfilActual={perfil}
            onEnviar={acciones.enviarSolicitud}
            existentes={[
              ...perfiles.map((p) => p.uid),
              ...salientes.map((s) => s.para),
              ...entrantes.map((s) => s.de),
            ]}
          />
        )}
      </AnimatePresence>

      <Modal
        abierto={!!paraQuitar}
        onCerrar={() => {
          if (!quitando) {
            setParaQuitar(null)
            setErrorQuitar(null)
          }
        }}
        titulo="Quitar amigo"
      >
        {paraQuitar && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar nombre={paraQuitar.displayName} url={paraQuitar.photoURL} tamano={48} />
              <div className="min-w-0">
                <p className="titulo-display text-base truncate">{paraQuitar.displayName}</p>
                <p className="text-xs text-crema/60 truncate">@{paraQuitar.username}</p>
              </div>
            </div>
            <p className="text-sm text-crema/80">
              ¿Seguro que quieres quitar a <span className="font-bold">@{paraQuitar.username}</span> de tus amigos?
              Dejarás de ver su álbum e intercambios. Si cambias de opinión tendrás que enviarle una nueva solicitud.
            </p>
            {errorQuitar && (
              <p className="text-sm text-rojo bg-rojo/10 border border-rojo/30 rounded-lg p-3">
                {errorQuitar}
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                variante="fantasma"
                onClick={() => {
                  setParaQuitar(null)
                  setErrorQuitar(null)
                }}
                disabled={quitando}
              >
                Cancelar
              </Button>
              <Button
                variante="peligro"
                cargando={quitando}
                onClick={confirmarQuitar}
                iconoIzq={<UserMinus className="h-4 w-4" />}
              >
                Quitar amigo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Section({
  titulo,
  cantidad,
  children,
}: {
  titulo: string
  cantidad: number
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2 px-1">
        <h2 className="titulo-display text-lg">{titulo}</h2>
        <Badge tono="neutro">{cantidad}</Badge>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function BuscarAmigo({
  uid,
  perfilActual,
  onEnviar,
  existentes,
}: {
  uid: string | undefined
  perfilActual: PerfilUsuario | null
  onEnviar: (p: PerfilUsuario) => Promise<void>
  existentes: string[]
}) {
  const [valor, setValor] = useState('')
  const [resultado, setResultado] = useState<PerfilUsuario | null | 'sin'>('sin')
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  const yaConectados = useMemo(() => new Set(existentes), [existentes])

  const onBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setExito(null)
    if (!valor.trim()) return
    setBuscando(true)
    try {
      const r = await buscarPorUsername(valor)
      setResultado(r ?? 'sin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar')
    } finally {
      setBuscando(false)
    }
  }

  const onSolicitar = async () => {
    if (!resultado || resultado === 'sin' || !perfilActual) return
    setError(null)
    setExito(null)
    setEnviando(true)
    try {
      await onEnviar(resultado)
      setExito(`Solicitud enviada a @${resultado.username}`)
      setResultado('sin')
      setValor('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <form onSubmit={onBuscar} className="space-y-3">
          <Input
            etiqueta="Buscar por nombre de usuario"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="goleador26"
            autoCapitalize="none"
            autoCorrect="off"
            ayuda="Pídele a tu amigo su @username dentro de la app"
          />
          <Button
            type="submit"
            ancho
            cargando={buscando}
            iconoIzq={<Search className="h-4 w-4" />}
          >
            Buscar
          </Button>
        </form>
      </Card>

      {error && (
        <p className="text-sm text-rojo bg-rojo/10 border border-rojo/30 rounded-lg p-3">
          {error}
        </p>
      )}
      {exito && (
        <p className="text-sm text-campo-200 bg-campo-500/10 border border-campo-300/30 rounded-lg p-3">
          {exito}
        </p>
      )}

      {resultado === 'sin' && valor && !buscando && (
        <p className="text-center text-sm text-crema/50">No se encontró ningún usuario con ese nombre.</p>
      )}

      {resultado && resultado !== 'sin' && (
        <Card className="flex items-center gap-3">
          <Avatar nombre={resultado.displayName} url={resultado.photoURL} tamano={48} />
          <div className="flex-1 min-w-0">
            <p className="titulo-display text-base truncate">{resultado.displayName}</p>
            <p className="text-xs text-crema/60">@{resultado.username}</p>
          </div>
          {resultado.uid === uid ? (
            <Badge>Eres tú</Badge>
          ) : yaConectados.has(resultado.uid) ? (
            <Badge tono="campo">Ya conectado</Badge>
          ) : (
            <Button
              variante="trofeo"
              tamano="sm"
              cargando={enviando}
              onClick={onSolicitar}
              iconoIzq={<UserPlus className="h-4 w-4" />}
            >
              Enviar solicitud
            </Button>
          )}
        </Card>
      )}

      <p className="text-center text-[11px] text-crema/40 pt-2">
        <Send className="inline h-3 w-3 mr-1" />
        Para verse necesitan aceptarse mutuamente
      </p>
    </motion.div>
  )
}

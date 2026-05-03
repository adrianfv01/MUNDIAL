import { motion } from 'framer-motion'
import { LogOut, Share2, Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, useResumen } from '@/hooks/useColeccion'
import { useAmigos } from '@/hooks/useAmigos'

export function PerfilPage() {
  const { user, perfil, cerrarSesion } = useAuth()
  const { estampas } = useCatalogo()
  const { coleccion } = useColeccion(user?.uid)
  const resumen = useResumen(coleccion, estampas)
  const { perfiles } = useAmigos(user?.uid)

  const compartir = async () => {
    if (!perfil) return
    const url = `${window.location.origin}/amigo/${perfil.username}`
    const texto = `Mi album del Mundial 2026 va al ${resumen.porcentaje}%! Buscame como @${perfil.username}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi album Mundial', text: texto, url })
      } else {
        await navigator.clipboard.writeText(`${texto} ${url}`)
        alert('Enlace copiado al portapapeles')
      }
    } catch {
      // cancelado
    }
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-trofeo-300/30 bg-gradient-to-br from-campo-700/60 via-campo-900/60 to-carbon p-5"
      >
        <div className="flex items-center gap-3">
          <Avatar nombre={perfil?.displayName} url={perfil?.photoURL} tamano={64} />
          <div className="min-w-0">
            <h1 className="titulo-display text-2xl truncate">
              {perfil?.displayName ?? user?.displayName ?? 'Coleccionista'}
            </h1>
            <p className="text-xs text-crema/70">@{perfil?.username}</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgresoBar
            valor={resumen.pegadas}
            total={resumen.total}
            etiqueta="Tu album"
            acento="trofeo"
            size="lg"
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Pegadas" valor={resumen.pegadas} />
          <Stat label="Repes" valor={resumen.repetidas} />
          <Stat label="Amigos" valor={perfiles.length} />
        </div>
      </motion.div>

      <Card className="!p-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-trofeo-300/15 border border-trofeo-300/30 p-2 text-trofeo-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-crema/60">Comparte tu @</p>
            <p className="text-sm text-crema">
              Pidele a tus amigos que te busquen como{' '}
              <span className="text-trofeo-300 font-bold">@{perfil?.username}</span>
            </p>
          </div>
          <Button tamano="sm" variante="secundario" iconoIzq={<Share2 className="h-4 w-4" />} onClick={compartir}>
            Compartir
          </Button>
        </div>
      </Card>

      <Card className="!p-3">
        <p className="text-xs uppercase tracking-wider text-crema/60 mb-1">Cuenta</p>
        <p className="text-sm text-crema/80 break-all">{user?.email ?? '-'}</p>
        <Button
          ancho
          variante="peligro"
          className="mt-4"
          onClick={cerrarSesion}
          iconoIzq={<LogOut className="h-4 w-4" />}
        >
          Cerrar sesion
        </Button>
      </Card>

      <p className="text-center text-[11px] text-crema/40">
        App de fans, no afiliada a FIFA o Panini.
      </p>
    </div>
  )
}

function Stat({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 py-2">
      <p className="titulo-display text-2xl text-trofeo-300">{valor}</p>
      <p className="text-[10px] uppercase tracking-wider text-crema/60">{label}</p>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  Copy,
  LogOut,
  Share2,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useColeccion, useResumen } from '@/hooks/useColeccion'
import { useAmigos } from '@/hooks/useAmigos'
import { CompartirPerfil } from '@/components/perfil/CompartirPerfil'

const FRASE_CONFIRMACION = 'ELIMINAR'

export function PerfilPage() {
  const { user, perfil, cerrarSesion, eliminarCuenta } = useAuth()
  const { estampas } = useCatalogo()
  const { coleccion } = useColeccion(user?.uid)
  const resumen = useResumen(coleccion, estampas)
  const { perfiles } = useAmigos(user?.uid)
  const [abrirCompartir, setAbrirCompartir] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [abrirEliminar, setAbrirEliminar] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const [passwordEliminar, setPasswordEliminar] = useState('')
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [requierePassword, setRequierePassword] = useState(false)

  const esCuentaPassword = user?.providerData?.[0]?.providerId === 'password'

  const cerrarModalEliminar = () => {
    if (eliminando) return
    setAbrirEliminar(false)
    setConfirmacion('')
    setPasswordEliminar('')
    setErrorEliminar(null)
    setRequierePassword(false)
  }

  const confirmarEliminacion = async () => {
    if (confirmacion.trim().toUpperCase() !== FRASE_CONFIRMACION) {
      setErrorEliminar(`Escribe ${FRASE_CONFIRMACION} para confirmar`)
      return
    }
    if (esCuentaPassword && !passwordEliminar) {
      setErrorEliminar('Ingresa tu contraseña para confirmar')
      setRequierePassword(true)
      return
    }
    setEliminando(true)
    setErrorEliminar(null)
    try {
      await eliminarCuenta(passwordEliminar || undefined)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/password-required') {
        setRequierePassword(true)
        setErrorEliminar('Necesitamos tu contraseña para confirmar')
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorEliminar('Contraseña incorrecta')
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorEliminar('Cerraste la ventana antes de confirmar')
      } else {
        setErrorEliminar(
          err instanceof Error ? err.message : 'No se pudo eliminar la cuenta',
        )
      }
      setEliminando(false)
    }
  }

  const copiarUsername = async () => {
    if (!perfil?.username) return
    try {
      await navigator.clipboard.writeText(`@${perfil.username}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1600)
    } catch {
      // sin permiso
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
            etiqueta="Tu álbum"
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

      <Card className="!p-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-trofeo-300/15 border border-trofeo-300/30 p-2 text-trofeo-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-crema/60">Comparte tu @</p>
            <p className="text-sm text-crema">
              Que te busquen como{' '}
              <span className="text-trofeo-300 font-bold">@{perfil?.username}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            tamano="sm"
            variante="secundario"
            iconoIzq={copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            onClick={copiarUsername}
            disabled={!perfil?.username}
          >
            {copiado ? 'Copiado' : 'Copiar @'}
          </Button>
          <Button
            tamano="sm"
            variante="trofeo"
            iconoIzq={<Share2 className="h-4 w-4" />}
            onClick={() => setAbrirCompartir(true)}
            disabled={!perfil?.username}
          >
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
          Cerrar sesión
        </Button>
      </Card>

      <p className="text-center text-[11px] text-crema/40">
        App de fans, no afiliada a FIFA o Panini.
      </p>

      <Card className="!p-3 border-rojo/30 bg-rojo/5">
        <p className="text-xs uppercase tracking-wider text-rojo/90 mb-1 font-semibold">
          Zona de peligro
        </p>
        <p className="text-xs text-crema/70">
          Elimina tu cuenta y todos tus datos del álbum. Esta acción no se puede
          deshacer.
        </p>
        <Button
          ancho
          variante="peligro"
          className="mt-3"
          onClick={() => setAbrirEliminar(true)}
          iconoIzq={<Trash2 className="h-4 w-4" />}
        >
          Eliminar cuenta
        </Button>
      </Card>

      {perfil && (
        <CompartirPerfil
          abierto={abrirCompartir}
          onCerrar={() => setAbrirCompartir(false)}
          username={perfil.username}
          displayName={perfil.displayName}
          porcentaje={resumen.porcentaje}
        />
      )}

      <Modal
        abierto={abrirEliminar}
        onCerrar={cerrarModalEliminar}
        titulo="Eliminar cuenta"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-rojo/10 border border-rojo/40 p-3">
            <AlertTriangle className="h-5 w-5 text-rojo shrink-0 mt-0.5" />
            <div className="text-sm text-crema/90 space-y-1">
              <p className="font-semibold">Esta acción es permanente.</p>
              <p className="text-crema/70 text-xs">
                Se borrarán tu álbum, repetidas, amigos, solicitudes y tu nombre
                de usuario <span className="text-trofeo-300">@{perfil?.username}</span>.
                No podremos recuperar nada después.
              </p>
            </div>
          </div>

          <Input
            etiqueta={`Escribe ${FRASE_CONFIRMACION} para confirmar`}
            value={confirmacion}
            onChange={(e) => {
              setConfirmacion(e.target.value)
              if (errorEliminar) setErrorEliminar(null)
            }}
            placeholder={FRASE_CONFIRMACION}
            autoComplete="off"
            autoCapitalize="characters"
            disabled={eliminando}
          />

          {esCuentaPassword && (
            <Input
              etiqueta="Tu contraseña"
              type="password"
              value={passwordEliminar}
              onChange={(e) => {
                setPasswordEliminar(e.target.value)
                if (errorEliminar) setErrorEliminar(null)
              }}
              placeholder="Confirma tu contraseña"
              autoComplete="current-password"
              ayuda={
                requierePassword
                  ? 'Necesitamos tu contraseña para confirmar la eliminación.'
                  : undefined
              }
              disabled={eliminando}
            />
          )}

          {!esCuentaPassword && (
            <p className="text-xs text-crema/60">
              Es posible que te pidamos volver a iniciar sesión con Google para
              confirmar.
            </p>
          )}

          {errorEliminar && (
            <p className="text-sm text-rojo">{errorEliminar}</p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variante="secundario"
              onClick={cerrarModalEliminar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variante="peligro"
              onClick={confirmarEliminacion}
              cargando={eliminando}
              iconoIzq={<Trash2 className="h-4 w-4" />}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
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

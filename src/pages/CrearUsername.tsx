import { useState } from 'react'
import { motion } from 'framer-motion'
import { AtSign, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { validarUsername } from '@/lib/utils'

export function CrearUsernamePage() {
  const { user, asignarUsername, cerrarSesion } = useAuth()
  const [valor, setValor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errVal = validarUsername(valor.toLowerCase())
    if (errVal) {
      setError(errVal)
      return
    }
    setCargando(true)
    try {
      await asignarUsername(valor.toLowerCase())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Sparkles className="mx-auto h-10 w-10 text-trofeo-300" />
          <h1 className="titulo-display mt-3 text-4xl text-crema">
            Elige tu <span className="text-trofeo-300">nombre</span>
          </h1>
          <p className="mt-2 text-sm text-crema/70">
            Hola {user?.displayName || user?.email}, este sera tu nombre publico para
            que tus amigos te encuentren e intercambien estampas contigo.
          </p>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              etiqueta="Nombre de usuario"
              name="username"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="goleador26"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              ayuda="Solo minusculas, numeros y guion bajo. Entre 3 y 20 caracteres."
              error={error}
              required
            />
            <div className="flex items-center gap-2 text-xs text-crema/50">
              <AtSign className="h-3 w-3" />
              <span>{valor ? `@${valor.toLowerCase()}` : '@tu_usuario'}</span>
            </div>
            <Button type="submit" ancho tamano="lg" variante="trofeo" cargando={cargando}>
              Continuar al album
            </Button>
            <button
              type="button"
              onClick={cerrarSesion}
              className="block w-full text-center text-xs text-crema/50 hover:text-crema/80 mt-2"
            >
              Cerrar sesion
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

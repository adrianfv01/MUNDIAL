import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, KeyRound, LogIn, Mail, Trophy, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

type Modo = 'login' | 'registro' | 'recuperar'

export function LoginPage() {
  const { user, loginGoogle, loginEmail, registroEmail, recuperarContrasena } = useAuth()
  const [modo, setModo] = useState<Modo>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mensajeOk, setMensajeOk] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  if (user) return <Navigate to="/" replace />

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo)
    setError(null)
    setMensajeOk(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMensajeOk(null)
    setCargando(true)
    try {
      if (modo === 'login') {
        await loginEmail(email, password)
      } else if (modo === 'registro') {
        await registroEmail(email, password, nombre)
      } else {
        await recuperarContrasena(email)
        setMensajeOk(
          'Te enviamos un correo con el enlace para restablecer tu contrasena. Revisa tu bandeja y la carpeta de spam.',
        )
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Ocurrio un error'
      setError(traducirError(m))
    } finally {
      setCargando(false)
    }
  }

  const onGoogle = async () => {
    setError(null)
    setMensajeOk(null)
    setCargando(true)
    try {
      await loginGoogle()
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Ocurrio un error'
      setError(traducirError(m))
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
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-trofeo-300 to-trofeo-500 text-carbon shadow-foil">
            <Trophy className="h-10 w-10" strokeWidth={2.5} />
          </div>
          <h1 className="titulo-display mt-5 text-5xl text-crema">
            Mi Album <span className="text-trofeo-300">Mundial</span>
          </h1>
          <p className="mt-2 text-sm text-crema/70">
            Lleva el registro de tus estampas e intercambia con tus amigos
          </p>
        </div>

        <Card className="space-y-4">
          {modo !== 'recuperar' && (
            <>
              <Button
                ancho
                tamano="lg"
                variante="trofeo"
                onClick={onGoogle}
                cargando={cargando && modo === 'login' && !email}
                iconoIzq={<LogoGoogle />}
              >
                Continuar con Google
              </Button>

              <div className="flex items-center gap-3">
                <span className="h-px bg-white/15 flex-1" />
                <span className="text-xs uppercase tracking-wider text-crema/40">o</span>
                <span className="h-px bg-white/15 flex-1" />
              </div>

              <div className="flex rounded-xl bg-white/5 p-1 borde-trofeo">
                {(['login', 'registro'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => cambiarModo(m)}
                    className={`flex-1 rounded-lg py-2 text-xs uppercase tracking-wider font-bold tap-target transition ${
                      modo === m
                        ? 'bg-trofeo-300 text-carbon'
                        : 'text-crema/70 hover:text-crema'
                    }`}
                  >
                    {m === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
                  </button>
                ))}
              </div>
            </>
          )}

          {modo === 'recuperar' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => cambiarModo('login')}
                className="inline-flex items-center gap-1 text-xs text-crema/70 hover:text-trofeo-300 tap-target"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a iniciar sesion
              </button>
              <h2 className="text-lg font-bold text-crema">Recuperar contrasena</h2>
              <p className="text-sm text-crema/60">
                Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva contrasena.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            {modo === 'registro' && (
              <Input
                etiqueta="Tu nombre"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Como apareceras"
                required
              />
            )}
            <Input
              etiqueta="Correo"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
            {modo !== 'recuperar' && (
              <>
                <Input
                  etiqueta="Contrasena"
                  name="password"
                  type="password"
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  required
                  minLength={6}
                />
                {modo === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => cambiarModo('recuperar')}
                      className="text-xs text-crema/70 hover:text-trofeo-300 tap-target"
                    >
                      Olvide mi contrasena
                    </button>
                  </div>
                )}
              </>
            )}

            {error && (
              <p className="text-sm text-rojo bg-rojo/10 border border-rojo/30 rounded-lg p-2">
                {error}
              </p>
            )}

            {mensajeOk && (
              <p className="text-sm text-trofeo-300 bg-trofeo-300/10 border border-trofeo-300/30 rounded-lg p-2">
                {mensajeOk}
              </p>
            )}

            <Button
              type="submit"
              ancho
              tamano="lg"
              cargando={cargando}
              iconoIzq={
                modo === 'login' ? (
                  <LogIn className="h-4 w-4" />
                ) : modo === 'registro' ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )
              }
            >
              {modo === 'login'
                ? 'Entrar'
                : modo === 'registro'
                  ? 'Crear cuenta'
                  : 'Enviar enlace de recuperacion'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-crema/50">
          <Mail className="inline h-3 w-3 mr-1" />
          Al continuar aceptas que esta es una app de fans, no afiliada a FIFA o Panini.
        </p>
        <p className="mt-2 text-center text-xs text-crema/40">
          <Link to="/" className="hover:text-trofeo-300">
            Mundial 2026 - USA / Canada / Mexico
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function LogoGoogle() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.3 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.3 29.5 5 24 5 16.3 5 9.6 9.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.4 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.3 5.2C40.6 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  )
}

function traducirError(msg: string): string {
  if (msg.includes('user-not-found')) return 'No existe una cuenta con ese correo'
  if (msg.includes('wrong-password') || msg.includes('invalid-credential'))
    return 'Correo o contrasena incorrectos'
  if (msg.includes('email-already-in-use')) return 'Ese correo ya esta registrado'
  if (msg.includes('weak-password')) return 'Contrasena demasiado debil'
  if (msg.includes('invalid-email')) return 'Correo invalido'
  if (msg.includes('missing-email')) return 'Ingresa tu correo'
  if (msg.includes('too-many-requests'))
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.'
  if (msg.includes('popup-closed-by-user')) return 'Cerraste la ventana de Google'
  if (msg.includes('network')) return 'Sin conexion a internet'
  return msg.replace('Firebase: ', '').replace(/\(auth\/[^)]+\)\.?/g, '').trim() || 'Ocurrio un error'
}

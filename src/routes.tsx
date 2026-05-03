import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PantallaCargando } from '@/components/ui/Spinner'
import { AppShell } from '@/components/layout/AppShell'
import { MiAlbumPage } from '@/pages/MiAlbum'

type Cargador<T> = () => Promise<{ default: T }>

/**
 * Envuelve un import dinámico para que reintente una vez y, si vuelve a fallar
 * (típico tras un deploy nuevo donde los hashes de chunks ya no existen), fuerce
 * un reload completo. Sin esto el Suspense se queda colgado para siempre.
 */
function lazyResiliente<T extends ComponentType<unknown>>(cargador: Cargador<T>) {
  return lazy(async () => {
    try {
      return await cargador()
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 350))
        return await cargador()
      } catch (err) {
        const clave = 'mundial:recarga-chunk'
        const yaIntento = sessionStorage.getItem(clave)
        if (!yaIntento) {
          sessionStorage.setItem(clave, String(Date.now()))
          window.location.reload()
          return new Promise<{ default: T }>(() => {})
        }
        throw err
      }
    }
  })
}

const cargarLogin = () => import('@/pages/Login').then((m) => ({ default: m.LoginPage }))
const cargarCrearUsername = () =>
  import('@/pages/CrearUsername').then((m) => ({ default: m.CrearUsernamePage }))
const cargarEquipo = () => import('@/pages/Equipo').then((m) => ({ default: m.EquipoPage }))
const cargarAmigos = () => import('@/pages/Amigos').then((m) => ({ default: m.AmigosPage }))
const cargarPerfilAmigo = () =>
  import('@/pages/PerfilAmigo').then((m) => ({ default: m.PerfilAmigoPage }))
const cargarIntercambios = () =>
  import('@/pages/Intercambios').then((m) => ({ default: m.IntercambiosPage }))
const cargarPerfil = () => import('@/pages/Perfil').then((m) => ({ default: m.PerfilPage }))

const LoginPage = lazyResiliente(cargarLogin)
const CrearUsernamePage = lazyResiliente(cargarCrearUsername)
const EquipoPage = lazyResiliente(cargarEquipo)
const AmigosPage = lazyResiliente(cargarAmigos)
const PerfilAmigoPage = lazyResiliente(cargarPerfilAmigo)
const IntercambiosPage = lazyResiliente(cargarIntercambios)
const PerfilPage = lazyResiliente(cargarPerfil)

let yaPrecargo = false
/**
 * Precarga en segundo plano los chunks de las páginas principales para que al
 * navegar desde el bottom nav ya estén listos. En celulares con red lenta esto
 * elimina el spinner largo al cambiar de sección.
 */
export function precargarRutasPrincipales() {
  if (yaPrecargo) return
  yaPrecargo = true
  const cargas: Cargador<unknown>[] = [
    cargarAmigos,
    cargarIntercambios,
    cargarPerfil,
    cargarEquipo,
    cargarPerfilAmigo,
  ]
  const ejecutar = () => {
    for (const c of cargas) {
      c().catch(() => {
        // si falla, el lazyResiliente se hará cargo cuando el user navegue
      })
    }
  }
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(ejecutar, { timeout: 2500 })
  } else {
    setTimeout(ejecutar, 1500)
  }
}

function Carga() {
  return <PantallaCargando mensaje="Cargando..." />
}

export function RutasApp() {
  const { user, perfil, cargando, necesitaUsername } = useAuth()

  if (cargando) {
    return <PantallaCargando mensaje="Cargando tu álbum..." />
  }

  if (!user) {
    return (
      <Suspense fallback={<Carga />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  if (necesitaUsername || !perfil) {
    return (
      <Suspense fallback={<Carga />}>
        <Routes>
          <Route path="/crear-usuario" element={<CrearUsernamePage />} />
          <Route path="*" element={<Navigate to="/crear-usuario" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Carga />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<MiAlbumPage />} />
          <Route path="/equipo/:codigo" element={<EquipoPage />} />
          <Route path="/intercambios" element={<IntercambiosPage />} />
          <Route path="/amigos" element={<AmigosPage />} />
          <Route path="/amigo/:username" element={<PerfilAmigoPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PantallaCargando } from '@/components/ui/Spinner'
import { AppShell } from '@/components/layout/AppShell'
import { MiAlbumPage } from '@/pages/MiAlbum'

const LoginPage = lazy(() => import('@/pages/Login').then((m) => ({ default: m.LoginPage })))
const CrearUsernamePage = lazy(() =>
  import('@/pages/CrearUsername').then((m) => ({ default: m.CrearUsernamePage })),
)
const EquipoPage = lazy(() =>
  import('@/pages/Equipo').then((m) => ({ default: m.EquipoPage })),
)
const AmigosPage = lazy(() =>
  import('@/pages/Amigos').then((m) => ({ default: m.AmigosPage })),
)
const PerfilAmigoPage = lazy(() =>
  import('@/pages/PerfilAmigo').then((m) => ({ default: m.PerfilAmigoPage })),
)
const IntercambiosPage = lazy(() =>
  import('@/pages/Intercambios').then((m) => ({ default: m.IntercambiosPage })),
)
const PerfilPage = lazy(() =>
  import('@/pages/Perfil').then((m) => ({ default: m.PerfilPage })),
)

function Carga() {
  return <PantallaCargando mensaje="Cargando..." />
}

export function RutasApp() {
  const { user, perfil, cargando, necesitaUsername } = useAuth()

  if (cargando) {
    return <PantallaCargando mensaje="Cargando tu album..." />
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

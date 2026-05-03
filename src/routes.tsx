import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PantallaCargando } from '@/components/ui/Spinner'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/Login'
import { CrearUsernamePage } from '@/pages/CrearUsername'
import { MiAlbumPage } from '@/pages/MiAlbum'
import { EquipoPage } from '@/pages/Equipo'
import { AmigosPage } from '@/pages/Amigos'
import { PerfilAmigoPage } from '@/pages/PerfilAmigo'
import { IntercambiosPage } from '@/pages/Intercambios'
import { PerfilPage } from '@/pages/Perfil'

export function RutasApp() {
  const { user, perfil, cargando, necesitaUsername } = useAuth()

  if (cargando) {
    return <PantallaCargando mensaje="Cargando tu album..." />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (necesitaUsername || !perfil) {
    return (
      <Routes>
        <Route path="/crear-usuario" element={<CrearUsernamePage />} />
        <Route path="*" element={<Navigate to="/crear-usuario" replace />} />
      </Routes>
    )
  }

  return (
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
  )
}

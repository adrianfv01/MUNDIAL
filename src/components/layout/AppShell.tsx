import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useRecordarUbicacion } from '@/hooks/useRecordarUbicacion'
import { precargarRutasPrincipales } from '@/routes'

export function AppShell() {
  useRecordarUbicacion()

  useEffect(() => {
    precargarRutasPrincipales()
  }, [])

  return (
    <div className="min-h-screen flex flex-col safe-top">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl lg:max-w-6xl px-4 lg:px-6 pt-4 pb-28 sm:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col safe-top">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 pt-4 pb-28 sm:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

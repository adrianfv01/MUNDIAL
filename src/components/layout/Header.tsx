import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BookMarked, Repeat2, Search, Trophy, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const BuscarEstampas = lazy(() =>
  import('@/components/buscar/BuscarEstampas').then((m) => ({ default: m.BuscarEstampas })),
)

const navItems = [
  { to: '/', label: 'Album', Icon: BookMarked, end: true },
  { to: '/intercambios', label: 'Intercambios', Icon: Repeat2 },
  { to: '/amigos', label: 'Amigos', Icon: Users },
]

export function Header() {
  const { perfil, user } = useAuth()
  const [buscar, setBuscar] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (buscar) setBuscar(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      <header className="sticky top-0 z-30 bg-carbon/80 backdrop-blur-md border-b border-trofeo-300/20">
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-trofeo-300 to-transparent" />
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 tap-target shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-trofeo-300 to-trofeo-500 text-carbon">
              <Trophy className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="titulo-display text-lg leading-none">
              Mundial<span className="text-trofeo-300">26</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition',
                    isActive
                      ? 'bg-trofeo-300/15 text-trofeo-300'
                      : 'text-crema/60 hover:text-crema/90 hover:bg-trofeo-300/5',
                  )
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setBuscar(true)}
              aria-label="Buscar estampa"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-crema tap-target transition"
            >
              <Search className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <Link to="/perfil" className="flex items-center gap-2 tap-target">
              <span className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs text-crema/60">@{perfil?.username ?? '...'}</span>
                <span className="text-[11px] text-trofeo-300/70 uppercase tracking-wider">
                  {perfil?.displayName ?? user?.displayName ?? 'tu album'}
                </span>
              </span>
              <Avatar nombre={perfil?.displayName ?? user?.displayName ?? '?'} url={perfil?.photoURL} tamano={36} />
            </Link>
          </div>
        </div>
      </header>
      {buscar && (
        <Suspense fallback={null}>
          <BuscarEstampas abierto={buscar} onCerrar={() => setBuscar(false)} />
        </Suspense>
      )}
    </>
  )
}

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

  const abrirBuscador = () => setBuscar(true)

  return (
    <>
      <header className="sticky top-0 z-30 bg-carbon/90 backdrop-blur-md border-b border-trofeo-300/20">
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-trofeo-300 to-transparent" />

        <div className="mx-auto max-w-3xl lg:max-w-6xl px-3 sm:px-4 lg:px-6 h-14 lg:h-16 flex items-center gap-2 sm:gap-3 lg:gap-5">
          <Link
            to="/"
            className="flex items-center gap-2 tap-target shrink-0"
            aria-label="Ir al album"
          >
            <span className="inline-flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-trofeo-300 to-trofeo-500 text-carbon shadow-foil">
              <Trophy className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2.5} />
            </span>
            <span className="titulo-display text-lg lg:text-xl leading-none hidden xs:inline">
              Mundial<span className="text-trofeo-300">26</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition',
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

          <button
            type="button"
            onClick={abrirBuscador}
            aria-label="Buscar estampa, jugador o equipo"
            className={cn(
              'flex-1 min-w-0 group relative',
              'inline-flex items-center gap-2.5 h-10 lg:h-11 px-4 rounded-full',
              'bg-gradient-to-r from-white/[0.09] via-white/[0.07] to-white/[0.09]',
              'hover:from-trofeo-300/10 hover:via-trofeo-300/5 hover:to-trofeo-300/10',
              'active:bg-white/[0.16]',
              'border border-trofeo-300/25 hover:border-trofeo-300/60',
              'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] hover:shadow-[0_0_20px_-4px_rgba(255,193,7,0.25)]',
              'text-left text-crema/70 hover:text-crema',
              'transition tap-target focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-trofeo-300/60 focus-visible:border-trofeo-300/60',
            )}
          >
            <Search
              className="h-4 w-4 lg:h-[18px] lg:w-[18px] shrink-0 text-trofeo-300 group-hover:scale-110 transition-transform"
              strokeWidth={2.5}
            />
            <span className="text-sm lg:text-[15px] font-medium truncate">
              <span className="sm:hidden">Buscar estampa...</span>
              <span className="hidden sm:inline lg:hidden">Buscar estampa, jugador o equipo...</span>
              <span className="hidden lg:inline">Buscar estampa, jugador o equipo del Mundial...</span>
            </span>
            <kbd className="hidden lg:inline-flex ml-auto items-center text-[10px] uppercase tracking-wider font-bold text-trofeo-300/80 bg-carbon/60 border border-trofeo-300/30 rounded px-1.5 py-0.5">
              /
            </kbd>
          </button>

          <Link
            to="/perfil"
            className="flex items-center gap-2.5 tap-target shrink-0 rounded-full lg:px-2 lg:py-1 lg:hover:bg-white/5 transition"
            aria-label="Ir a mi perfil"
          >
            <span className="hidden lg:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-crema/85">
                {perfil?.displayName ?? user?.displayName ?? 'tu album'}
              </span>
              <span className="text-[11px] text-trofeo-300/80 uppercase tracking-wider">
                @{perfil?.username ?? '...'}
              </span>
            </span>
            <Avatar
              nombre={perfil?.displayName ?? user?.displayName ?? '?'}
              url={perfil?.photoURL}
              tamano={36}
            />
          </Link>
        </div>
      </header>

      {buscar && (
        <Suspense fallback={null}>
          <BuscarEstampas abierto={buscar} onCerrar={() => setBuscar(false)} />
        </Suspense>
      )}

      <AtajoTeclado onAbrir={abrirBuscador} />
    </>
  )
}

function AtajoTeclado({ onAbrir }: { onAbrir: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        onAbrir()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAbrir])
  return null
}

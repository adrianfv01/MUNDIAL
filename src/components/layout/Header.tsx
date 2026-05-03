import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/Avatar'

export function Header() {
  const { perfil, user } = useAuth()
  return (
    <header className="sticky top-0 z-30 bg-carbon/80 backdrop-blur-md border-b border-trofeo-300/20">
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-trofeo-300 to-transparent" />
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 tap-target">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-trofeo-300 to-trofeo-500 text-carbon">
            <Trophy className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="titulo-display text-lg leading-none">
            Mundial<span className="text-trofeo-300">26</span>
          </span>
        </Link>
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
    </header>
  )
}

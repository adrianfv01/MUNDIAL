import { NavLink } from 'react-router-dom'
import { BookMarked, Repeat2, Users, UserCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Album', Icon: BookMarked, end: true },
  { to: '/intercambios', label: 'Intercambios', Icon: Repeat2 },
  { to: '/amigos', label: 'Amigos', Icon: Users },
  { to: '/perfil', label: 'Perfil', Icon: UserCircle2 },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-carbon/90 backdrop-blur-md border-t border-trofeo-300/20 safe-bottom">
      <div className="mx-auto max-w-3xl lg:max-w-6xl grid grid-cols-4">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2.5 tap-target text-[11px] font-semibold uppercase tracking-wider transition',
                isActive ? 'text-trofeo-300' : 'text-crema/60 hover:text-crema/90',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'inline-flex items-center justify-center h-9 w-9 rounded-full transition',
                    isActive && 'bg-trofeo-300/15',
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

import { cn } from '@/lib/utils'

interface AvatarProps {
  nombre?: string
  url?: string
  tamano?: number
  className?: string
}

function iniciales(nombre?: string): string {
  if (!nombre) return '?'
  const partes = nombre.trim().split(/\s+/)
  return partes
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

export function Avatar({ nombre, url, tamano = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-campo-500 to-campo-700 text-crema font-bold uppercase border border-trofeo-300/40 overflow-hidden shrink-0',
        className,
      )}
      style={{ width: tamano, height: tamano, fontSize: tamano * 0.4 }}
    >
      {url ? (
        <img src={url} alt={nombre ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span>{iniciales(nombre)}</span>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block rounded-full border-current border-r-transparent border-solid animate-spin text-trofeo-300',
        className,
      )}
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 12)) }}
    />
  )
}

export function PantallaCargando({ mensaje }: { mensaje?: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
      <Spinner size={42} />
      {mensaje && <p className="text-sm text-crema/70">{mensaje}</p>}
    </div>
  )
}

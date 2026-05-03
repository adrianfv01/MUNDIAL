import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'trofeo'
type Tamano = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
  iconoIzq?: ReactNode
  iconoDer?: ReactNode
  ancho?: boolean
}

const baseClases =
  'tap-target inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-wide rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-trofeo-300/70'

const porVariante: Record<Variante, string> = {
  primario:
    'bg-campo-500 hover:bg-campo-400 active:bg-campo-600 text-crema shadow-estampa',
  secundario:
    'bg-white/10 hover:bg-white/15 active:bg-white/20 text-crema borde-trofeo',
  fantasma:
    'bg-transparent hover:bg-white/5 text-crema',
  peligro:
    'bg-rojo hover:bg-rojo-oscuro text-crema shadow-estampa',
  trofeo:
    'bg-trofeo-300 hover:bg-trofeo-400 active:bg-trofeo-500 text-carbon shadow-estampa',
}

const porTamano: Record<Tamano, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base py-3',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  cargando,
  iconoIzq,
  iconoDer,
  ancho,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || cargando}
      className={cn(
        baseClases,
        porVariante[variante],
        porTamano[tamano],
        ancho && 'w-full',
        className,
      )}
    >
      {cargando ? (
        <span
          aria-hidden
          className="inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      ) : (
        iconoIzq
      )}
      <span>{children}</span>
      {!cargando && iconoDer}
    </button>
  )
}

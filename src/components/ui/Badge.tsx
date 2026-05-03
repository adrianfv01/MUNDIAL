import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tono = 'campo' | 'trofeo' | 'rojo' | 'celeste' | 'neutro'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tono?: Tono
}

const porTono: Record<Tono, string> = {
  campo: 'bg-campo-500/20 text-campo-200 border-campo-300/40',
  trofeo: 'bg-trofeo-300/20 text-trofeo-200 border-trofeo-300/50',
  rojo: 'bg-rojo/20 text-red-200 border-red-300/40',
  celeste: 'bg-celeste/20 text-celeste-100 border-celeste/40',
  neutro: 'bg-white/10 text-crema border-white/20',
}

export function Badge({ tono = 'neutro', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        porTono[tono],
        className,
      )}
      {...rest}
    />
  )
}

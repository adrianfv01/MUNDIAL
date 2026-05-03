import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variante?: 'panel' | 'solido' | 'bare'
}

export function Card({ variante = 'panel', className, ...rest }: CardProps) {
  const claseBase =
    variante === 'solido'
      ? 'panel-solid'
      : variante === 'bare'
        ? 'rounded-2xl'
        : 'panel'

  return <div className={cn(claseBase, 'p-4', className)} {...rest} />
}

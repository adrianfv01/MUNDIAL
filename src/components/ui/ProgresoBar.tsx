import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgresoBarProps {
  valor: number
  total: number
  etiqueta?: string
  acento?: 'trofeo' | 'campo' | 'celeste'
  size?: 'sm' | 'md' | 'lg'
  mostrarNumeros?: boolean
}

const acentos = {
  trofeo: 'from-trofeo-300 via-trofeo-200 to-trofeo-400',
  campo: 'from-campo-400 via-campo-300 to-campo-500',
  celeste: 'from-celeste via-celeste to-celeste-oscuro',
}

const sizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

export function ProgresoBar({
  valor,
  total,
  etiqueta,
  acento = 'trofeo',
  size = 'md',
  mostrarNumeros = true,
}: ProgresoBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((valor / total) * 100)) : 0

  return (
    <div className="w-full">
      {(etiqueta || mostrarNumeros) && (
        <div className="flex items-baseline justify-between mb-1.5">
          {etiqueta && (
            <span className="text-xs uppercase tracking-wider text-crema/70 font-semibold">
              {etiqueta}
            </span>
          )}
          {mostrarNumeros && (
            <span className="text-xs font-bold text-trofeo-200">
              {valor}
              <span className="text-crema/50">/{total}</span>
              <span className="ml-1 text-crema/40">({pct}%)</span>
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-white/10 border border-white/10',
          sizes[size],
        )}
      >
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r', acentos[acento])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

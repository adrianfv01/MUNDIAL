import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Equipo } from '@/lib/types'
import { ProgresoBar } from '@/components/ui/ProgresoBar'
import { cn } from '@/lib/utils'

interface EquipoCardProps {
  equipo: Equipo
  pegadas: number
  total: number
  to?: string
}

export function EquipoCard({ equipo, pegadas, total, to }: EquipoCardProps) {
  const pct = total > 0 ? Math.round((pegadas / total) * 100) : 0
  const completo = pct === 100

  return (
    <Link to={to ?? `/equipo/${equipo.codigo}`} className="block tap-target">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border p-3 transition shadow-estampa',
          completo ? 'border-trofeo-300/70' : 'border-white/10 bg-white/5',
        )}
        style={{
          backgroundImage: `linear-gradient(135deg, ${equipo.colorPrimario}33, ${equipo.colorSecundario}22)`,
        }}
      >
        {completo && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-trofeo-300 text-carbon px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow">
            Completo
          </span>
        )}
        <div className="flex items-center gap-3">
          <img
            src={`https://flagcdn.com/${equipo.bandera.toLowerCase()}.svg`}
            alt={equipo.nombre}
            className="h-12 w-12 rounded-full object-cover border-2 border-white/30 shadow"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="titulo-display text-base text-crema leading-none truncate">
              {equipo.nombre}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-crema/60 mt-1">
              Grupo {equipo.grupo} · {equipo.confederacion}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ProgresoBar
            valor={pegadas}
            total={total}
            size="sm"
            mostrarNumeros
            etiqueta=""
            acento={completo ? 'trofeo' : 'campo'}
          />
        </div>
      </motion.div>
    </Link>
  )
}

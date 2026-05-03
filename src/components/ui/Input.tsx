import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string
  error?: string | null
  ayuda?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { etiqueta, error, ayuda, className, id, ...rest },
  ref,
) {
  const idCampo = id ?? rest.name
  return (
    <label className="block w-full" htmlFor={idCampo}>
      {etiqueta && (
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-crema/70 font-semibold">
          {etiqueta}
        </span>
      )}
      <input
        ref={ref}
        id={idCampo}
        className={cn(
          'w-full rounded-xl border bg-white/5 border-white/15 px-4 py-3 text-crema placeholder:text-crema/40 outline-none transition focus:border-trofeo-300/70 focus:bg-white/10',
          error && 'border-rojo/70 focus:border-rojo',
          className,
        )}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-rojo">{error}</span>
      ) : ayuda ? (
        <span className="mt-1 block text-xs text-crema/50">{ayuda}</span>
      ) : null}
    </label>
  )
})

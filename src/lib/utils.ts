import clsx, { type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function porcentaje(parte: number, total: number): number {
  if (!total) return 0
  return Math.round((parte / total) * 100)
}

export function ordenarUids(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

export function idAmistad(a: string, b: string): string {
  const [x, y] = ordenarUids(a, b)
  return `${x}_${y}`
}

export function idSolicitud(de: string, para: string): string {
  return `${de}_${para}`
}

export function validarUsername(value: string): string | null {
  if (!value) return 'Ingresa un nombre de usuario'
  if (value.length < 3) return 'Minimo 3 caracteres'
  if (value.length > 20) return 'Maximo 20 caracteres'
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Solo minusculas, numeros y guion bajo'
  }
  return null
}

export function formatearFecha(fecha: number | Date | undefined): string {
  if (!fecha) return ''
  const d = typeof fecha === 'number' ? new Date(fecha) : fecha
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

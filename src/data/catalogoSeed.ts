import type { Estampa } from '@/lib/types'
import { equipos } from './equipos'

const POSICIONES = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL'] as const

function nombrePlaceholder(equipoNombre: string, numero: number, tipo: string): string {
  if (tipo === 'escudo') return `Escudo ${equipoNombre}`
  if (tipo === 'plantel') return `Plantel ${equipoNombre}`
  return `Jugador ${numero}`
}

export const ESTAMPAS_POR_EQUIPO = 20

// Genera 20 estampas por equipo:
// 1: escudo, 2: foto plantel, 3-20: 18 jugadores con posicion sugerida
export function generarEstampasEquipo(codigo: string, nombre: string): Estampa[] {
  const lista: Estampa[] = []

  lista.push({
    id: `${codigo}1`,
    equipoId: codigo,
    tipo: 'escudo',
    numero: 1,
    nombre: nombrePlaceholder(nombre, 1, 'escudo'),
    foil: true,
    orden: 1,
  })

  lista.push({
    id: `${codigo}2`,
    equipoId: codigo,
    tipo: 'plantel',
    numero: 2,
    nombre: nombrePlaceholder(nombre, 2, 'plantel'),
    orden: 2,
  })

  for (let i = 3; i <= ESTAMPAS_POR_EQUIPO; i++) {
    const indicePos = Math.min(POSICIONES.length - 1, i - 3)
    lista.push({
      id: `${codigo}${i}`,
      equipoId: codigo,
      tipo: 'jugador',
      numero: i,
      nombre: nombrePlaceholder(nombre, i, 'jugador'),
      posicion: POSICIONES[indicePos],
      orden: i,
    })
  }

  return lista
}

// Estampas especiales (FWC) - mascotas, trofeo, balon, sedes, leyendas, etc.
const ESPECIALES_DEFINICION: Array<{ id: string; nombre: string; foil?: boolean }> = [
  { id: 'FWC1', nombre: 'Logo oficial Mundial 2026', foil: true },
  { id: 'FWC2', nombre: 'Trofeo FIFA', foil: true },
  { id: 'FWC3', nombre: 'Mascota Maple (Canada)', foil: true },
  { id: 'FWC4', nombre: 'Mascota Zayu (Mexico)', foil: true },
  { id: 'FWC5', nombre: 'Mascota Clutch (USA)', foil: true },
  { id: 'FWC6', nombre: 'Balon oficial' },
  { id: 'FWC7', nombre: 'Poster oficial' },
  { id: 'FWC8', nombre: 'Sede - Toronto' },
  { id: 'FWC9', nombre: 'Sede - Vancouver' },
  { id: 'FWC10', nombre: 'Sede - Estadio Azteca (CDMX)' },
  { id: 'FWC11', nombre: 'Sede - Guadalajara' },
  { id: 'FWC12', nombre: 'Sede - Monterrey' },
  { id: 'FWC13', nombre: 'Sede - Atlanta' },
  { id: 'FWC14', nombre: 'Sede - Boston' },
  { id: 'FWC15', nombre: 'Sede - Dallas' },
  { id: 'FWC16', nombre: 'Sede - Houston' },
  { id: 'FWC17', nombre: 'Sede - Kansas City' },
  { id: 'FWC18', nombre: 'Sede - Los Angeles' },
  { id: 'FWC19', nombre: 'Sede - Miami' },
  { id: 'FWC20', nombre: 'Sede - New York / New Jersey' },
  { id: 'FWC21', nombre: 'Sede - Filadelfia' },
  { id: 'FWC22', nombre: 'Sede - San Francisco' },
  { id: 'FWC23', nombre: 'Sede - Seattle' },
  { id: 'FWC24', nombre: 'Leyenda 1' },
  { id: 'FWC25', nombre: 'Leyenda 2' },
  { id: 'FWC26', nombre: 'Leyenda 3' },
  { id: 'FWC27', nombre: 'Leyenda 4' },
  { id: 'FWC28', nombre: 'Leyenda 5', foil: true },
  { id: 'FWC29', nombre: 'Leyenda 6', foil: true },
  { id: 'FWC30', nombre: 'Mosaico campeones', foil: true },
]

export function generarEstampasEspeciales(): Estampa[] {
  return ESPECIALES_DEFINICION.map((e, idx) => ({
    id: e.id,
    equipoId: 'FWC',
    tipo: 'especial' as const,
    numero: idx + 1,
    nombre: e.nombre,
    foil: e.foil ?? false,
    orden: idx + 1,
  }))
}

export function generarCatalogoCompleto(): Estampa[] {
  const lista: Estampa[] = []
  for (const e of equipos) {
    lista.push(...generarEstampasEquipo(e.codigo, e.nombre))
  }
  lista.push(...generarEstampasEspeciales())
  return lista
}

export const catalogoCompleto = generarCatalogoCompleto()
export const totalEstampas = catalogoCompleto.length

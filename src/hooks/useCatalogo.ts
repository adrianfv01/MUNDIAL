import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { equipos as equiposSeed } from '@/data/equipos'
import { catalogoCompleto } from '@/data/catalogoSeed'
import { imagenesEstampas } from '@/data/imagenesEstampas'
import type { Equipo, Estampa } from '@/lib/types'

// Aplica el mapa local `imagenesEstampas` sobre cualquier lista de estampas
// (ya sea la del seed o la cargada desde Firestore). Asi puedes agregar fotos
// editando solo `imagenesEstampas.ts` sin re-correr `npm run seed`.
function aplicarImagenesLocales(lista: Estampa[]): Estampa[] {
  return lista.map((e) => {
    const ruta = imagenesEstampas[e.id]
    if (!ruta) return e
    if (e.imagen === ruta) return e
    return { ...e, imagen: ruta }
  })
}

interface CatalogoData {
  equipos: Equipo[]
  estampas: Estampa[]
  cargando: boolean
  error: string | null
}

const CLAVE_CACHE = 'mundial26:catalogo:v1'
const TTL_CACHE_MS = 1000 * 60 * 60 * 24 * 7 // 7 dias

interface CachePersistido {
  ts: number
  equipos?: Equipo[]
  estampas?: Estampa[]
}

let cacheEquipos: Equipo[] | null = null
let cacheEstampas: Estampa[] | null = null
let cargaEnVuelo: Promise<void> | null = null

function leerCachePersistido(): CachePersistido | null {
  try {
    const raw = localStorage.getItem(CLAVE_CACHE)
    if (!raw) return null
    const data = JSON.parse(raw) as CachePersistido
    if (!data.ts || Date.now() - data.ts > TTL_CACHE_MS) return null
    return data
  } catch {
    return null
  }
}

function guardarCachePersistido(data: CachePersistido) {
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify({ ...data, ts: Date.now() }))
  } catch {
    // sin espacio o modo privado: ignoramos
  }
}

if (typeof window !== 'undefined' && (!cacheEquipos || !cacheEstampas)) {
  const persistido = leerCachePersistido()
  if (persistido?.equipos?.length) cacheEquipos = persistido.equipos
  if (persistido?.estampas?.length) {
    cacheEstampas = aplicarImagenesLocales(persistido.estampas)
  }
}

async function cargarCatalogoRemoto(): Promise<void> {
  if (cargaEnVuelo) return cargaEnVuelo
  cargaEnVuelo = (async () => {
    try {
      const [eqsSnap, catSnap] = await Promise.all([
        getDocs(collection(db, 'equipos')),
        getDocs(collection(db, 'catalogo')),
      ])
      let nuevoEquipos: Equipo[] | undefined
      let nuevoEstampas: Estampa[] | undefined
      if (!eqsSnap.empty) {
        nuevoEquipos = eqsSnap.docs.map((d) => d.data() as Equipo)
        cacheEquipos = nuevoEquipos
      }
      if (!catSnap.empty) {
        nuevoEstampas = aplicarImagenesLocales(
          catSnap.docs.map((d) => d.data() as Estampa),
        )
        cacheEstampas = nuevoEstampas
      }
      if (nuevoEquipos || nuevoEstampas) {
        guardarCachePersistido({
          ts: Date.now(),
          equipos: cacheEquipos ?? undefined,
          estampas: cacheEstampas ?? undefined,
        })
      }
    } finally {
      cargaEnVuelo = null
    }
  })()
  return cargaEnVuelo
}

export function useCatalogo(): CatalogoData {
  const [equipos, setEquipos] = useState<Equipo[]>(cacheEquipos ?? equiposSeed)
  const [estampas, setEstampas] = useState<Estampa[]>(cacheEstampas ?? catalogoCompleto)
  const [cargando, setCargando] = useState(!cacheEstampas)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    cargarCatalogoRemoto()
      .then(() => {
        if (cancelado) return
        if (cacheEquipos) setEquipos(cacheEquipos)
        if (cacheEstampas) setEstampas(cacheEstampas)
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el catalogo')
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  return { equipos, estampas, cargando, error }
}

export function useEstampasEquipo(codigoEquipo: string | undefined) {
  const { estampas, cargando } = useCatalogo()

  const filtradas = useMemo(() => {
    if (!codigoEquipo) return []
    return estampas
      .filter((e) => e.equipoId === codigoEquipo)
      .sort((a, b) => a.orden - b.orden)
  }, [estampas, codigoEquipo])

  return { estampas: filtradas, cargando }
}

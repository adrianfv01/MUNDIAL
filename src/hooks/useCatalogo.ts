import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { equipos as equiposSeed } from '@/data/equipos'
import { catalogoCompleto } from '@/data/catalogoSeed'
import type { Equipo, Estampa } from '@/lib/types'

interface CatalogoData {
  equipos: Equipo[]
  estampas: Estampa[]
  cargando: boolean
  error: string | null
}

let cacheEquipos: Equipo[] | null = null
let cacheEstampas: Estampa[] | null = null

export function useCatalogo(): CatalogoData {
  const [equipos, setEquipos] = useState<Equipo[]>(cacheEquipos ?? equiposSeed)
  const [estampas, setEstampas] = useState<Estampa[]>(cacheEstampas ?? catalogoCompleto)
  const [cargando, setCargando] = useState(!cacheEstampas)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const [eqsSnap, catSnap] = await Promise.all([
          getDocs(collection(db, 'equipos')),
          getDocs(collection(db, 'catalogo')),
        ])
        if (cancelado) return
        if (!eqsSnap.empty) {
          const lista = eqsSnap.docs.map((d) => d.data() as Equipo)
          cacheEquipos = lista
          setEquipos(lista)
        }
        if (!catSnap.empty) {
          const lista = catSnap.docs.map((d) => d.data() as Estampa)
          cacheEstampas = lista
          setEstampas(lista)
        }
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el catalogo')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  return { equipos, estampas, cargando, error }
}

export function useEstampasEquipo(codigoEquipo: string | undefined) {
  const { estampas } = useCatalogo()
  const [estampasRemoto, setEstampasRemoto] = useState<Estampa[] | null>(null)
  const [cargandoRemoto, setCargandoRemoto] = useState(false)

  useEffect(() => {
    if (!codigoEquipo) return
    let cancelado = false
    async function cargar() {
      setCargandoRemoto(true)
      try {
        const q = query(collection(db, 'catalogo'), where('equipoId', '==', codigoEquipo))
        const snap = await getDocs(q)
        if (!cancelado && !snap.empty) {
          setEstampasRemoto(snap.docs.map((d) => d.data() as Estampa))
        }
      } catch {
        // silencioso, usaremos el seed local
      } finally {
        if (!cancelado) setCargandoRemoto(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [codigoEquipo])

  const filtradas = useMemo(() => {
    const fuente = estampasRemoto ?? estampas
    return fuente
      .filter((e) => e.equipoId === codigoEquipo)
      .sort((a, b) => a.orden - b.orden)
  }, [estampasRemoto, estampas, codigoEquipo])

  return { estampas: filtradas, cargando: cargandoRemoto }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Coleccion, Estampa, ResumenColeccion } from '@/lib/types'

export function useColeccion(uid: string | undefined) {
  const [coleccion, setColeccion] = useState<Coleccion>({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!uid) {
      setColeccion({})
      setCargando(false)
      return
    }
    setCargando(true)
    const ref = collection(db, 'usuarios', uid, 'coleccion')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const c: Coleccion = {}
        snap.forEach((d) => {
          const data = d.data() as { cantidad: number; updatedAt: number }
          if (data.cantidad > 0) c[d.id] = data
        })
        setColeccion(c)
        setCargando(false)
      },
      () => setCargando(false),
    )
    return unsub
  }, [uid])

  const actualizar = useCallback(
    async (estampaId: string, cantidad: number) => {
      if (!uid) return
      const ref = doc(db, 'usuarios', uid, 'coleccion', estampaId)
      const valor = Math.max(0, Math.min(999, Math.floor(cantidad)))
      if (valor === 0) {
        await deleteDoc(ref).catch(() => {
          // Si no existe, ignorar
        })
      } else {
        await setDoc(ref, { cantidad: valor, updatedAt: Date.now() })
      }
    },
    [uid],
  )

  const incrementar = useCallback(
    (estampaId: string) => {
      const actual = coleccion[estampaId]?.cantidad ?? 0
      return actualizar(estampaId, actual + 1)
    },
    [coleccion, actualizar],
  )

  const decrementar = useCallback(
    (estampaId: string) => {
      const actual = coleccion[estampaId]?.cantidad ?? 0
      if (actual <= 0) return Promise.resolve()
      return actualizar(estampaId, actual - 1)
    },
    [coleccion, actualizar],
  )

  return { coleccion, cargando, actualizar, incrementar, decrementar }
}

export function calcularResumen(coleccion: Coleccion, estampas: Estampa[]): ResumenColeccion {
  let pegadas = 0
  let repetidas = 0
  for (const e of estampas) {
    const item = coleccion[e.id]
    if (item && item.cantidad > 0) {
      pegadas += 1
      if (item.cantidad > 1) repetidas += item.cantidad - 1
    }
  }
  const total = estampas.length
  const faltantes = total - pegadas
  const porcentaje = total === 0 ? 0 : Math.round((pegadas / total) * 100)
  return { total, pegadas, faltantes, repetidas, porcentaje }
}

export function useResumen(coleccion: Coleccion, estampas: Estampa[]) {
  return useMemo(() => calcularResumen(coleccion, estampas), [coleccion, estampas])
}

// Carga puntual (no realtime) de la coleccion de otro usuario.
export async function cargarColeccionUsuario(uid: string): Promise<Coleccion> {
  const ref = collection(db, 'usuarios', uid, 'coleccion')
  const snap = await getDocs(ref)
  const c: Coleccion = {}
  snap.forEach((d) => {
    const data = d.data() as { cantidad: number; updatedAt: number }
    if (data.cantidad > 0) c[d.id] = data
  })
  return c
}

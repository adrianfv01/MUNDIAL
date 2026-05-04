import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment as fsIncrement,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Coleccion, Estampa, ResumenColeccion } from '@/lib/types'

// Tiempo durante el cual confiamos en el valor optimista local
// aunque Firestore aún no haya devuelto el snapshot actualizado.
const VENTANA_OPTIMISTA_MS = 4000

interface ItemOptimista {
  cantidad: number
  hasta: number
}

export function useColeccion(uid: string | undefined) {
  const [coleccionRemota, setColeccionRemota] = useState<Coleccion>({})
  const [optimista, setOptimista] = useState<Record<string, ItemOptimista>>({})
  const [cargando, setCargando] = useState(true)
  const optimistaRef = useRef(optimista)
  optimistaRef.current = optimista

  useEffect(() => {
    if (!uid) {
      setColeccionRemota({})
      setOptimista({})
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
        setColeccionRemota(c)
        setCargando(false)
      },
      () => setCargando(false),
    )
    return unsub
  }, [uid])

  // Limpia entradas optimistas que ya expiraron o que coinciden con el remoto.
  useEffect(() => {
    if (Object.keys(optimista).length === 0) return
    const ahora = Date.now()
    let cambio = false
    const siguiente: Record<string, ItemOptimista> = {}
    for (const [id, item] of Object.entries(optimista)) {
      const remoto = coleccionRemota[id]?.cantidad ?? 0
      if (item.hasta <= ahora || item.cantidad === remoto) {
        cambio = true
        continue
      }
      siguiente[id] = item
    }
    if (cambio) setOptimista(siguiente)
    const restante = Object.values(siguiente).reduce(
      (min, it) => Math.min(min, it.hasta),
      Number.POSITIVE_INFINITY,
    )
    if (restante !== Number.POSITIVE_INFINITY) {
      const t = window.setTimeout(
        () => setOptimista({ ...optimistaRef.current }),
        Math.max(50, restante - ahora),
      )
      return () => window.clearTimeout(t)
    }
  }, [optimista, coleccionRemota])

  // Coleccion visible: combinacion de snapshot remoto + override optimista.
  const coleccion = useMemo<Coleccion>(() => {
    const ahora = Date.now()
    const merged: Coleccion = { ...coleccionRemota }
    for (const [id, item] of Object.entries(optimista)) {
      if (item.hasta <= ahora) continue
      if (item.cantidad > 0) {
        merged[id] = { cantidad: item.cantidad, updatedAt: ahora }
      } else {
        delete merged[id]
      }
    }
    return merged
  }, [coleccionRemota, optimista])

  const escribir = useCallback(
    async (estampaId: string, delta: number, valorObjetivo: number) => {
      if (!uid) return
      const ref = doc(db, 'usuarios', uid, 'coleccion', estampaId)
      // Para llegar a 0 escribimos cantidad: 0 (no borramos) porque las reglas
      // exigen request.resource.data.cantidad y un delete no las cumple. Despues
      // intentamos limpiar con deleteDoc por si las reglas ya lo permiten.
      if (valorObjetivo <= 0) {
        await setDoc(ref, { cantidad: 0, updatedAt: serverTimestamp() }, { merge: true }).catch(
          () => {
            /* sin permisos o documento inexistente: ignorar */
          },
        )
        // Limpieza opcional, ignoramos errores si las reglas no permiten delete.
        deleteDoc(ref).catch(() => {})
        return
      }
      // Si el documento aun no existe, increment lo crea con el delta.
      // setDoc con merge garantiza que solo tocamos los campos enviados.
      await setDoc(
        ref,
        {
          cantidad: fsIncrement(delta),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ).catch(async () => {
        // Fallback: si falla por algun motivo (p. ej. doc inexistente y delta
        // negativo), hacemos un setDoc directo con el valor objetivo.
        await setDoc(ref, { cantidad: valorObjetivo, updatedAt: Date.now() }).catch(() => {
          /* si tambien falla, no podemos hacer mas */
        })
      })
    },
    [uid],
  )

  const aplicarDelta = useCallback(
    (estampaId: string, delta: number) => {
      if (!uid) return Promise.resolve()
      const remoto = coleccionRemota[estampaId]?.cantidad ?? 0
      const previoOptimista = optimistaRef.current[estampaId]?.cantidad
      const previoVisible =
        previoOptimista !== undefined ? previoOptimista : remoto
      const objetivo = Math.max(0, Math.min(999, previoVisible + delta))
      const deltaReal = objetivo - previoVisible
      if (deltaReal === 0) return Promise.resolve()
      setOptimista((prev) => ({
        ...prev,
        [estampaId]: {
          cantidad: objetivo,
          hasta: Date.now() + VENTANA_OPTIMISTA_MS,
        },
      }))
      return escribir(estampaId, deltaReal, objetivo)
    },
    [coleccionRemota, escribir, uid],
  )

  const incrementar = useCallback(
    (estampaId: string) => aplicarDelta(estampaId, 1),
    [aplicarDelta],
  )

  const decrementar = useCallback(
    (estampaId: string) => aplicarDelta(estampaId, -1),
    [aplicarDelta],
  )

  const actualizar = useCallback(
    (estampaId: string, cantidad: number) => {
      const remoto = coleccionRemota[estampaId]?.cantidad ?? 0
      const previoOptimista = optimistaRef.current[estampaId]?.cantidad
      const actual =
        previoOptimista !== undefined ? previoOptimista : remoto
      return aplicarDelta(estampaId, cantidad - actual)
    },
    [aplicarDelta, coleccionRemota],
  )

  const aplicarIntercambio = useCallback(
    async ({
      entregas,
      recibes,
      amigoUid,
    }: {
      entregas: string[]
      recibes: string[]
      amigoUid: string
    }) => {
      if (!uid) {
        return { miOk: false, amigoOk: false, miError: 'Sin sesion', amigoError: null }
      }

      // Lado propio: usamos aplicarDelta para mantener feedback optimista.
      let miError: string | null = null
      try {
        const propios: Promise<unknown>[] = []
        for (const id of entregas) propios.push(aplicarDelta(id, -1))
        for (const id of recibes) propios.push(aplicarDelta(id, +1))
        await Promise.all(propios)
      } catch (err) {
        miError = err instanceof Error ? err.message : 'Error al actualizar tu coleccion'
      }

      // Lado del amigo: escritura directa por incremento. Necesita reglas
      // que permitan a un amigo aplicar +-1 a la cantidad.
      let amigoError: string | null = null
      try {
        await Promise.all([
          ...entregas.map((id) =>
            setDoc(
              doc(db, 'usuarios', amigoUid, 'coleccion', id),
              { cantidad: fsIncrement(1), updatedAt: serverTimestamp() },
              { merge: true },
            ),
          ),
          ...recibes.map((id) =>
            setDoc(
              doc(db, 'usuarios', amigoUid, 'coleccion', id),
              { cantidad: fsIncrement(-1), updatedAt: serverTimestamp() },
              { merge: true },
            ),
          ),
        ])
      } catch (err) {
        amigoError =
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar la coleccion del amigo'
      }

      return {
        miOk: miError === null,
        amigoOk: amigoError === null,
        miError,
        amigoError,
      }
    },
    [aplicarDelta, uid],
  )

  return { coleccion, cargando, actualizar, incrementar, decrementar, aplicarIntercambio }
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

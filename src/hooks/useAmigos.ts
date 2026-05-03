import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PerfilUsuario, SolicitudAmistad } from '@/lib/types'
import { idAmistad, idSolicitud } from '@/lib/utils'

export function useSolicitudes(uid: string | undefined) {
  const [entrantes, setEntrantes] = useState<SolicitudAmistad[]>([])
  const [salientes, setSalientes] = useState<SolicitudAmistad[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!uid) {
      setEntrantes([])
      setSalientes([])
      setCargando(false)
      return
    }
    setCargando(true)
    const qEntrantes = query(
      collection(db, 'solicitudesAmistad'),
      where('para', '==', uid),
      where('estado', '==', 'pendiente'),
      orderBy('createdAt', 'desc'),
    )
    const qSalientes = query(
      collection(db, 'solicitudesAmistad'),
      where('de', '==', uid),
      where('estado', '==', 'pendiente'),
      orderBy('createdAt', 'desc'),
    )
    let activos = 2
    const acabar = () => {
      activos -= 1
      if (activos <= 0) setCargando(false)
    }
    const u1 = onSnapshot(
      qEntrantes,
      (s) => {
        setEntrantes(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SolicitudAmistad, 'id'>) })))
        acabar()
      },
      acabar,
    )
    const u2 = onSnapshot(
      qSalientes,
      (s) => {
        setSalientes(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SolicitudAmistad, 'id'>) })))
        acabar()
      },
      acabar,
    )
    return () => {
      u1()
      u2()
    }
  }, [uid])

  return { entrantes, salientes, cargando }
}

export function useAmigos(uid: string | undefined) {
  const [amigosUids, setAmigosUids] = useState<string[]>([])
  const [perfiles, setPerfiles] = useState<PerfilUsuario[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!uid) {
      setAmigosUids([])
      setPerfiles([])
      setCargando(false)
      return
    }
    setCargando(true)
    const q = query(
      collection(db, 'amistades'),
      where('usuarios', 'array-contains', uid),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(
      q,
      async (snap) => {
        const otros: string[] = []
        snap.forEach((d) => {
          const data = d.data() as { usuarios: string[] }
          const otro = data.usuarios.find((u) => u !== uid)
          if (otro) otros.push(otro)
        })
        setAmigosUids(otros)
        if (otros.length === 0) {
          setPerfiles([])
          setCargando(false)
          return
        }
        try {
          const docs = await Promise.all(
            otros.map((u) =>
              getDoc(doc(db, 'usuarios', u)).catch(() => null),
            ),
          )
          const lista: PerfilUsuario[] = []
          docs.forEach((d) => {
            if (d && d.exists()) lista.push(d.data() as PerfilUsuario)
          })
          setPerfiles(lista)
        } catch (err) {
          console.error('[useAmigos] error cargando perfiles', err)
        } finally {
          setCargando(false)
        }
      },
      (err) => {
        console.error('[useAmigos] snapshot error', err)
        setCargando(false)
      },
    )
    return unsub
  }, [uid])

  return { amigosUids, perfiles, cargando }
}

export async function buscarPorUsername(username: string): Promise<PerfilUsuario | null> {
  const norm = username.toLowerCase().trim()
  if (!norm) return null
  const q = query(collection(db, 'usuarios'), where('username', '==', norm), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].data() as PerfilUsuario
}

export function useAccionesAmistad(uidActual: string | undefined, perfilActual: PerfilUsuario | null) {
  const enviarSolicitud = useCallback(
    async (destino: PerfilUsuario) => {
      if (!uidActual || !perfilActual) throw new Error('No hay sesion')
      if (destino.uid === uidActual) throw new Error('No puedes agregarte a ti mismo')

      const ref = doc(db, 'solicitudesAmistad', idSolicitud(uidActual, destino.uid))
      const refInversa = doc(db, 'solicitudesAmistad', idSolicitud(destino.uid, uidActual))
      const refAmistad = doc(db, 'amistades', idAmistad(uidActual, destino.uid))

      const yaAmigos = await getDoc(refAmistad)
      if (yaAmigos.exists()) throw new Error('Ya son amigos')

      const inversa = await getDoc(refInversa)
      if (inversa.exists() && (inversa.data().estado === 'pendiente')) {
        // Si ya nos envio una, aceptamos
        await aceptarSolicitud(uidActual, refInversa.id, destino.uid)
        return
      }

      const ya = await getDoc(ref)
      if (ya.exists() && ya.data().estado === 'pendiente') {
        throw new Error('Ya enviaste solicitud a este usuario')
      }

      await setDoc(ref, {
        de: uidActual,
        para: destino.uid,
        deUsername: perfilActual.username,
        paraUsername: destino.username,
        estado: 'pendiente',
        createdAt: Date.now(),
      })
    },
    [uidActual, perfilActual],
  )

  const cancelarSolicitud = useCallback(async (idSol: string) => {
    await deleteDoc(doc(db, 'solicitudesAmistad', idSol))
  }, [])

  const aceptar = useCallback(
    async (idSol: string, otroUid: string) => {
      if (!uidActual) throw new Error('No hay sesion')
      await aceptarSolicitud(uidActual, idSol, otroUid)
    },
    [uidActual],
  )

  const rechazar = useCallback(async (idSol: string) => {
    await deleteDoc(doc(db, 'solicitudesAmistad', idSol))
  }, [])

  const eliminarAmigo = useCallback(async (otroUid: string) => {
    if (!uidActual) return
    await deleteDoc(doc(db, 'amistades', idAmistad(uidActual, otroUid)))
  }, [uidActual])

  return { enviarSolicitud, cancelarSolicitud, aceptar, rechazar, eliminarAmigo }
}

async function aceptarSolicitud(uidActual: string, idSol: string, otroUid: string) {
  const refSol = doc(db, 'solicitudesAmistad', idSol)
  const refAmistad = doc(db, 'amistades', idAmistad(uidActual, otroUid))
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(refSol)
    if (!snap.exists()) return
    const data = snap.data()
    if (data.para !== uidActual) throw new Error('No tienes permiso para aceptar')
    const [a, b] = uidActual < otroUid ? [uidActual, otroUid] : [otroUid, uidActual]
    tx.set(refAmistad, {
      usuarios: [a, b],
      createdAt: serverTimestamp(),
    })
    tx.delete(refSol)
  })
}

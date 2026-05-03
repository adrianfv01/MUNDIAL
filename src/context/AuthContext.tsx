import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'
import type { PerfilUsuario } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  perfil: PerfilUsuario | null
  cargando: boolean
  necesitaUsername: boolean
  loginGoogle: () => Promise<void>
  loginEmail: (email: string, password: string) => Promise<void>
  registroEmail: (email: string, password: string, displayName: string) => Promise<void>
  recuperarContrasena: (email: string) => Promise<void>
  cerrarSesion: () => Promise<void>
  asignarUsername: (username: string) => Promise<void>
  eliminarCuenta: (password?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)
  const [cargandoPerfil, setCargandoPerfil] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setCargandoAuth(false)
      if (!u) {
        setPerfil(null)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    setCargandoPerfil(true)
    const ref = doc(db, 'usuarios', user.uid)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setPerfil(snap.data() as PerfilUsuario)
        } else {
          setPerfil(null)
        }
        setCargandoPerfil(false)
      },
      () => {
        setCargandoPerfil(false)
      },
    )
    return unsub
  }, [user])

  const loginGoogle = async () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, googleProvider)
  }

  const loginEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const registroEmail = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(cred.user, { displayName })
    }
  }

  const recuperarContrasena = async (email: string) => {
    const correo = email.trim()
    if (!correo) throw new Error('Ingresa tu correo')
    await sendPasswordResetEmail(auth, correo)
  }

  const cerrarSesion = async () => {
    await signOut(auth)
  }

  const asignarUsername = async (username: string) => {
    if (!user) throw new Error('No hay sesión')
    const usernameNorm = username.toLowerCase().trim()
    const refUsername = doc(db, 'usernames', usernameNorm)
    const refUsuario = doc(db, 'usuarios', user.uid)

    await runTransaction(db, async (tx) => {
      const snapUsername = await tx.get(refUsername)
      if (snapUsername.exists()) {
        throw new Error('Ese nombre de usuario ya está tomado')
      }
      const snapUsuario = await tx.get(refUsuario)
      const datosBase: Record<string, unknown> = {
        uid: user.uid,
        username: usernameNorm,
        displayName: user.displayName || usernameNorm,
        createdAt: Date.now(),
      }
      if (user.photoURL) datosBase.photoURL = user.photoURL
      if (user.email) datosBase.email = user.email
      tx.set(refUsername, { uid: user.uid, createdAt: serverTimestamp() })
      if (snapUsuario.exists()) {
        tx.update(refUsuario, { username: usernameNorm })
      } else {
        tx.set(refUsuario, datosBase)
      }
    })
  }

  const reautenticar = async (actual: User, password?: string) => {
    const provider = actual.providerData[0]?.providerId
    if (provider === 'google.com') {
      googleProvider.setCustomParameters({ prompt: 'select_account' })
      await reauthenticateWithPopup(actual, googleProvider)
      return
    }
    if (provider === 'password') {
      if (!actual.email) throw new Error('La cuenta no tiene correo asociado')
      if (!password) {
        const err = new Error('Necesitamos tu contraseña para confirmar')
        ;(err as Error & { code?: string }).code = 'auth/password-required'
        throw err
      }
      const cred = EmailAuthProvider.credential(actual.email, password)
      await reauthenticateWithCredential(actual, cred)
      return
    }
    throw new Error('No podemos reautenticar este tipo de cuenta')
  }

  const limpiarDatosFirestore = async (uid: string, username?: string) => {
    const errores: unknown[] = []

    try {
      const colRef = collection(db, 'usuarios', uid, 'coleccion')
      const snap = await getDocs(colRef)
      await Promise.allSettled(snap.docs.map((d) => deleteDoc(d.ref)))
    } catch (err) {
      errores.push(err)
    }

    try {
      const qDe = query(collection(db, 'solicitudesAmistad'), where('de', '==', uid))
      const qPara = query(collection(db, 'solicitudesAmistad'), where('para', '==', uid))
      const [snapDe, snapPara] = await Promise.all([getDocs(qDe), getDocs(qPara)])
      const refs = new Map<string, ReturnType<typeof doc>>()
      snapDe.docs.forEach((d) => refs.set(d.id, d.ref))
      snapPara.docs.forEach((d) => refs.set(d.id, d.ref))
      await Promise.allSettled(Array.from(refs.values()).map((r) => deleteDoc(r)))
    } catch (err) {
      errores.push(err)
    }

    try {
      const qAmistades = query(
        collection(db, 'amistades'),
        where('usuarios', 'array-contains', uid),
      )
      const snap = await getDocs(qAmistades)
      await Promise.allSettled(snap.docs.map((d) => deleteDoc(d.ref)))
    } catch (err) {
      errores.push(err)
    }

    if (username) {
      try {
        await deleteDoc(doc(db, 'usernames', username))
      } catch (err) {
        errores.push(err)
      }
    }

    try {
      await deleteDoc(doc(db, 'usuarios', uid))
    } catch (err) {
      errores.push(err)
    }

    if (errores.length > 0) {
      console.warn('[eliminarCuenta] errores parciales en Firestore', errores)
    }
  }

  const eliminarCuenta = async (password?: string) => {
    const actual = auth.currentUser
    if (!actual) throw new Error('No hay sesión activa')
    const uid = actual.uid
    const username = perfil?.username

    await limpiarDatosFirestore(uid, username)

    try {
      await deleteUser(actual)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/requires-recent-login') {
        await reautenticar(actual, password)
        await deleteUser(actual)
        return
      }
      throw err
    }
  }

  const necesitaUsername = !!user && !cargandoPerfil && (!perfil || !perfil.username)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      perfil,
      cargando: cargandoAuth || (!!user && cargandoPerfil),
      necesitaUsername,
      loginGoogle,
      loginEmail,
      registroEmail,
      recuperarContrasena,
      cerrarSesion,
      asignarUsername,
      eliminarCuenta,
    }),
    [user, perfil, cargandoAuth, cargandoPerfil, necesitaUsername],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
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
  cerrarSesion: () => Promise<void>
  asignarUsername: (username: string) => Promise<void>
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

  const cerrarSesion = async () => {
    await signOut(auth)
  }

  const asignarUsername = async (username: string) => {
    if (!user) throw new Error('No hay sesion')
    const usernameNorm = username.toLowerCase().trim()
    const refUsername = doc(db, 'usernames', usernameNorm)
    const refUsuario = doc(db, 'usuarios', user.uid)

    await runTransaction(db, async (tx) => {
      const snapUsername = await tx.get(refUsername)
      if (snapUsername.exists()) {
        throw new Error('Ese nombre de usuario ya esta tomado')
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
      cerrarSesion,
      asignarUsername,
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

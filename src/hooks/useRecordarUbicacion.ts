import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const CLAVE = 'mundial:ultima-ruta'
const TTL_MS = 1000 * 60 * 60 * 24 * 7

interface UbicacionGuardada {
  ruta: string
  ts: number
}

export function limpiarUbicacionGuardada() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // localStorage no disponible
  }
}

/**
 * En PWAs instaladas (sobre todo iOS), cuando el sistema suspende y vuelve a
 * abrir la app, se relanza desde el start_url ("/"), perdiendo la ruta actual.
 * Este hook guarda la ruta visitada y la restaura cuando detectamos ese caso.
 */
export function useRecordarUbicacion() {
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const yaRestauro = useRef(false)

  useEffect(() => {
    if (yaRestauro.current) return
    yaRestauro.current = true

    if (ubicacion.pathname !== '/' || ubicacion.search || ubicacion.hash) return

    try {
      const crudo = localStorage.getItem(CLAVE)
      if (!crudo) return
      const datos = JSON.parse(crudo) as UbicacionGuardada
      if (!datos?.ruta || datos.ruta === '/') return
      if (Date.now() - datos.ts > TTL_MS) return
      navegar(datos.ruta, { replace: true })
    } catch {
      // datos corruptos o storage bloqueado
    }
  }, [ubicacion.pathname, ubicacion.search, ubicacion.hash, navegar])

  useEffect(() => {
    const ruta = ubicacion.pathname + ubicacion.search + ubicacion.hash
    try {
      const datos: UbicacionGuardada = { ruta, ts: Date.now() }
      localStorage.setItem(CLAVE, JSON.stringify(datos))
    } catch {
      // localStorage no disponible
    }
  }, [ubicacion.pathname, ubicacion.search, ubicacion.hash])
}

import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

interface Inicio {
  x: number
  y: number
  t: number
  id: number
}

interface Opciones {
  umbralPx?: number
  duracionMaxMs?: number
}

// Hook compartido para evitar que un scroll dispare un "tap" por accidente.
// Usa pointer events: registra la posicion al apretar y solo invoca el callback
// si el dedo se movio menos de `umbralPx` pixeles y el gesto duro menos de
// `duracionMaxMs`. Pensado para listas largas en movil.
export function useTapNoScroll<T extends HTMLElement>(
  onTap: (e: ReactPointerEvent<T>) => void,
  { umbralPx = 10, duracionMaxMs = 500 }: Opciones = {},
) {
  const inicio = useRef<Inicio | null>(null)

  const onPointerDown = useCallback((e: ReactPointerEvent<T>) => {
    inicio.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now(),
      id: e.pointerId,
    }
  }, [])

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<T>) => {
      const i = inicio.current
      inicio.current = null
      if (!i || i.id !== e.pointerId) return
      const dx = Math.abs(e.clientX - i.x)
      const dy = Math.abs(e.clientY - i.y)
      if (dx + dy > umbralPx) return
      if (Date.now() - i.t > duracionMaxMs) return
      onTap(e)
    },
    [onTap, umbralPx, duracionMaxMs],
  )

  const onPointerCancel = useCallback(() => {
    inicio.current = null
  }, [])

  const onPointerLeave = useCallback((e: ReactPointerEvent<T>) => {
    const i = inicio.current
    if (!i || i.id !== e.pointerId) return
    inicio.current = null
  }, [])

  return { onPointerDown, onPointerUp, onPointerCancel, onPointerLeave }
}

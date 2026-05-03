import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo?: string
  children: ReactNode
}

export function Modal({ abierto, onCerrar, titulo, children }: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [abierto])

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCerrar}
          />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg panel-solid p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              {titulo && (
                <h2 className="titulo-display text-2xl text-trofeo-300">{titulo}</h2>
              )}
              <button
                type="button"
                onClick={onCerrar}
                className="ml-auto rounded-full p-1 hover:bg-white/10 tap-target"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

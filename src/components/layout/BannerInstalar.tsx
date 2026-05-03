import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const KEY_DESCARTADO = 'mundial:install-dismissed-at'
const RECORDAR_DIAS = 7

export function BannerInstalar() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const beforeInstall = e as BeforeInstallPromptEvent

      const descartadoAt = localStorage.getItem(KEY_DESCARTADO)
      if (descartadoAt) {
        const tiempo = Number(descartadoAt)
        if (Date.now() - tiempo < RECORDAR_DIAS * 24 * 60 * 60 * 1000) return
      }

      setEvento(beforeInstall)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalar = async () => {
    if (!evento) return
    await evento.prompt()
    const { outcome } = await evento.userChoice
    if (outcome !== 'dismissed') {
      setVisible(false)
      setEvento(null)
    } else {
      cerrar()
    }
  }

  const cerrar = () => {
    localStorage.setItem(KEY_DESCARTADO, String(Date.now()))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-3 bottom-20 sm:bottom-4 z-40 mx-auto max-w-md panel-solid p-3 flex items-center gap-3"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-trofeo-300 text-carbon">
            <Download className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="titulo-display text-sm">Instala la app</p>
            <p className="text-[11px] text-crema/60">Acceso rapido y modo offline</p>
          </div>
          <button
            onClick={instalar}
            className="rounded-lg bg-trofeo-300 text-carbon px-3 py-2 text-xs font-bold uppercase tracking-wider tap-target"
          >
            Instalar
          </button>
          <button
            onClick={cerrar}
            className="rounded-full p-1.5 text-crema/60 hover:text-crema tap-target"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

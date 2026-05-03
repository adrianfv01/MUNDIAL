import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Link2, QrCode, Share2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface CompartirPerfilProps {
  abierto: boolean
  onCerrar: () => void
  username: string
  displayName?: string
  porcentaje: number
}

type EstadoCopia = 'idle' | 'username' | 'link' | 'todo'

export function CompartirPerfil({
  abierto,
  onCerrar,
  username,
  displayName,
  porcentaje,
}: CompartirPerfilProps) {
  const [copiado, setCopiado] = useState<EstadoCopia>('idle')
  const [verQR, setVerQR] = useState(false)

  const url = useMemo(
    () => `${window.location.origin}/amigo/${username}`,
    [username],
  )
  const texto = useMemo(
    () =>
      `Mi album del Mundial 2026 va al ${porcentaje}%. Buscame como @${username} para intercambiar estampas.`,
    [username, porcentaje],
  )
  const textoCompleto = `${texto} ${url}`

  useEffect(() => {
    if (copiado === 'idle') return
    const t = setTimeout(() => setCopiado('idle'), 1800)
    return () => clearTimeout(t)
  }, [copiado])

  const copiar = async (valor: string, tipo: EstadoCopia) => {
    try {
      await navigator.clipboard.writeText(valor)
      setCopiado(tipo)
    } catch {
      // sin permiso al portapapeles
    }
  }

  const compartirNativo = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName ? `Album de ${displayName}` : 'Mi album Mundial 2026',
          text: texto,
          url,
        })
      } else {
        await copiar(textoCompleto, 'todo')
      }
    } catch {
      // cancelado por el usuario
    }
  }

  const linkWhatsapp = `https://wa.me/?text=${encodeURIComponent(textoCompleto)}`
  const linkQR = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&color=0E7C3A&bgcolor=FFFFFF&data=${encodeURIComponent(url)}`

  const cerrar = () => {
    setVerQR(false)
    setCopiado('idle')
    onCerrar()
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo="Compartir tu album">
      <div className="space-y-4">
        <div className="rounded-2xl border border-trofeo-300/30 bg-gradient-to-br from-campo-700/40 to-carbon p-4">
          <p className="text-[11px] uppercase tracking-wider text-crema/60">Tu nombre de usuario</p>
          <button
            type="button"
            onClick={() => copiar(username, 'username')}
            className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 px-3 py-2.5 text-left tap-target transition"
            aria-label="Copiar nombre de usuario"
          >
            <span className="titulo-display text-2xl text-trofeo-300 truncate">@{username}</span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold ${
                copiado === 'username' ? 'text-campo-200' : 'text-crema/70'
              }`}
            >
              {copiado === 'username' ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </span>
          </button>

          <p className="mt-3 text-[11px] uppercase tracking-wider text-crema/60">Enlace directo</p>
          <button
            type="button"
            onClick={() => copiar(url, 'link')}
            className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 px-3 py-2 text-left tap-target transition"
            aria-label="Copiar enlace"
          >
            <span className="text-xs text-crema/90 truncate">{url}</span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold shrink-0 ${
                copiado === 'link' ? 'text-campo-200' : 'text-crema/70'
              }`}
            >
              {copiado === 'link' ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copiado === 'link' ? 'Copiado' : 'Copiar'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variante="trofeo"
            iconoIzq={<Share2 className="h-4 w-4" />}
            onClick={compartirNativo}
            ancho
          >
            Compartir
          </Button>
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] active:bg-[#199e4a] text-white font-semibold uppercase tracking-wide text-sm h-11 px-5 shadow-estampa transition"
          >
            <IconoWhatsapp className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setVerQR((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-3 tap-target transition"
        >
          <span className="flex items-center gap-2 text-sm text-crema">
            <QrCode className="h-4 w-4 text-trofeo-300" />
            <span className="font-semibold uppercase tracking-wider text-xs">
              {verQR ? 'Ocultar codigo QR' : 'Mostrar codigo QR'}
            </span>
          </span>
          <span className="text-[11px] text-crema/60">Para escanear de cerca</span>
        </button>

        {verQR && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
            <img
              src={linkQR}
              alt={`Codigo QR para @${username}`}
              width={240}
              height={240}
              className="h-60 w-60"
              loading="lazy"
            />
            <p className="text-[11px] text-carbon/70 text-center">
              Apunten su camara para abrir tu album
            </p>
          </div>
        )}

        <p className="text-center text-[11px] text-crema/40">
          {copiado === 'todo' && 'Texto y enlace copiados al portapapeles'}
        </p>
      </div>
    </Modal>
  )
}

function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.821 11.821 0 0 1 3.48 8.414c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.99 3.617 3.969-1.576zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.371s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    </svg>
  )
}

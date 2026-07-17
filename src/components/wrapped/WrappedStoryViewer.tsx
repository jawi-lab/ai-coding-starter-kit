'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useGroupWrapped } from '@/hooks/useGroupWrapped'
import { WrappedSlide } from './WrappedSlide'
import {
  nodeToPng,
  shareWrappedImage,
  wrappedImageFileName,
  SHARE_DESIGN_WIDTH,
  SHARE_DESIGN_HEIGHT,
} from '@/lib/wrapped-share'

interface WrappedStoryViewerProps {
  groupId: string
  /** Rückblick-Jahr — `null` schließt/rendert den Viewer nicht. */
  year: number | null
  onClose: () => void
}

/**
 * Vollbild-Story-Viewer für den Mellon Rückblick (PROJ-18).
 *
 * Öffnet bei Slide 1, zeigt Fortschritts-Segmente (eins pro Slide), Tipp-Zonen
 * (rechts weiter / links zurück), Schließen- und Teilen-Button. Der Datensammler
 * (`useGroupWrapped`) liefert nur anzeigbare Slides — hier wird nichts mehr
 * übersprungen. Geteilt wird die aktuelle Slide als PNG (9:16) aus einer
 * unsichtbaren Share-Bühne über das native Share-Sheet bzw. den Web-Fallback.
 */
export function WrappedStoryViewer({ groupId, year, onClose }: WrappedStoryViewerProps) {
  const { slides, loading, error } = useGroupWrapped(groupId, year)
  const [index, setIndex] = useState(0)
  const [sharing, setSharing] = useState(false)
  const shareStageRef = useRef<HTMLDivElement>(null)

  const open = year !== null

  // Bei jedem Öffnen (neues Jahr) vorne beginnen.
  useEffect(() => {
    if (open) setIndex(0)
  }, [open, year])

  const total = slides?.length ?? 0
  const current = slides?.[index] ?? null

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= total) {
        onClose()
        return i
      }
      return i + 1
    })
  }, [total, onClose])

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  // Tastatur auf dem Desktop: Pfeile blättern, Escape schließt.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, goNext, goPrev, onClose])

  const handleShare = useCallback(async () => {
    if (sharing || !shareStageRef.current || !current) return
    setSharing(true)
    try {
      const dataUrl = await nodeToPng(shareStageRef.current)
      const filename = wrappedImageFileName(`Mellon-Rueckblick-${year}`)
      const result = await shareWrappedImage(dataUrl, `Mellon Rückblick ${year}`, filename)
      if (result === 'downloaded') toast.success('Bild gespeichert')
      else if (result === 'error') toast.error('Teilen fehlgeschlagen')
    } catch {
      toast.error('Teilen fehlgeschlagen')
    } finally {
      setSharing(false)
    }
  }, [sharing, current, year])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Mellon Rückblick ${year}`}
      className="fixed inset-0 z-[70] bg-black animate-mellon-fade-in"
    >
      {/* Slide-Bühne */}
      <div className="absolute inset-0">
        {current ? (
          <WrappedSlide slide={current} />
        ) : error ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-[15px] font-[700] text-[#FBF8F3]">Rückblick konnte nicht geladen werden</p>
            <button onClick={onClose} className="text-[13px] font-[600] text-[#D9A24B]">Schließen</button>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#173829]">
            <Loader2 className="h-7 w-7 animate-spin text-[#D9A24B]" aria-label={loading ? 'Rückblick wird geladen' : undefined} />
          </div>
        )}
      </div>

      {/* Tipp-Zonen (unter den Steuer-Buttons): rechts weiter, links zurück. */}
      {current && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Vorherige Slide"
            className="absolute left-0 top-0 h-full w-1/2"
          />
          <button
            type="button"
            onClick={goNext}
            aria-label="Nächste Slide"
            className="absolute right-0 top-0 h-full w-1/2"
          />
        </>
      )}

      {/* Kopf: Fortschritts-Segmente + Schließen (über den Tipp-Zonen). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-200"
                style={{ width: i <= index ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Rückblick schließen"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur active:scale-95"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Teilen-Button unten (über den Tipp-Zonen). */}
      {current && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            aria-label="Diese Slide teilen"
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-[14px] font-[700] text-[#221E19] shadow-lg active:scale-[0.97] disabled:opacity-60"
          >
            {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {sharing ? 'Wird erstellt…' : 'Teilen'}
          </button>
        </div>
      )}

      {/* Unsichtbare Share-Bühne — dieselbe Slide im Story-Format fürs PNG. */}
      {current && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-9999px] top-0"
          style={{ width: SHARE_DESIGN_WIDTH, height: SHARE_DESIGN_HEIGHT }}
        >
          <div ref={shareStageRef} style={{ width: SHARE_DESIGN_WIDTH, height: SHARE_DESIGN_HEIGHT }}>
            <WrappedSlide slide={current} variant="share" />
          </div>
        </div>
      )}
    </div>
  )
}
